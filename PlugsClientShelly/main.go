package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"github.com/gorilla/websocket"
	"io"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"sync"
	"time"
)

var addr = flag.String("addr", "localhost:8083", "http service address")
var tokenRaw = flag.String("token", "", "token_raw")

type event struct {
	Event       string      `json:"event"`
	DataPayload interface{} `json:"data_payload"`
}

type token struct {
	Token string `json:"token"`
}

type plugs struct {
	Plugs []plug `json:"plugs"`
}

type plug struct {
	PlugId       int    `json:"plugid"`
	Ipaddr       net.IP `json:"ipaddr"`
	AllowedState bool   `json:"allowed_state"`
}

type plugPower struct {
	Token       string  `json:"ControlerToken"` // TODO: fix the typo in the server
	PlugId      int     `json:"ID"`
	Ipaddr      net.IP  `json:"IP"`
	State       bool    `json:"ON"`
	Voltage     float64 `json:"Voltage"`
	Current     float64 `json:"Current"`
	Power       float64 `json:"Power"`
	TotalEnergy float64 `json:"TotalEnergy"`
}

type switchEnergy struct {
	Total    float64   `json:"total"`
	ByMinute []float64 `json:"by_minute"`
	MinuteTS int64     `json:"minute_ts"`
}

type switchTemperature struct {
	TC float64 `json:"tC"`
	TF float64 `json:"tF"`
}

type SwitchStatus struct {
	ID          int               `json:"id"`
	Source      string            `json:"source"`
	Output      bool              `json:"output"`
	APower      float64           `json:"apower"`
	Voltage     float64           `json:"voltage"`
	Current     float64           `json:"current"`
	AEnergy     switchEnergy      `json:"aenergy"`
	Temperature switchTemperature `json:"temperature"`
	IP          net.IP
}

var plugPowerChannel chan event

// Custom unmarshal method for the plug struct
func (p *plug) UnmarshalJSON(data []byte) error {
	type Alias plug
	aux := &struct {
		Ipaddr string `json:"ipaddr"`
		*Alias
	}{
		Alias: (*Alias)(p),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}
	ip := net.ParseIP(aux.Ipaddr)
	if ip == nil {
		return fmt.Errorf("invalid IP address: %s", aux.Ipaddr)
	}
	p.Ipaddr = ip
	return nil
}

func GetPlugPower(settings plug) SwitchStatus {
	//goland:noinspection HttpUrlsUsage
	switchUrl := &url.URL{
		Scheme: "http",
		Host:   settings.Ipaddr.String(),
		Path:   "/rpc/Switch.GetStatus",
	}
	queryParams := url.Values{}
	queryParams.Set("id", "0")
	switchUrl.RawQuery = queryParams.Encode()

	var resp, err = http.Get(switchUrl.String())
	if err != nil {
		panic(err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {

		}
	}(resp.Body)

	//fmt.Println("Response Status:", resp.Status)

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading plug response body: %v\n", err)
		os.Exit(1)
	}

	var data SwitchStatus
	err = json.Unmarshal([]byte(body), &data)
	if err != nil {
		fmt.Println("Error unmarshaling plug JSON:", err)
		os.Exit(1)
	}
	data.IP = settings.Ipaddr
	//fmt.Println(data)
	SetPlugState(settings.Ipaddr, settings.AllowedState, settings.PlugId, data)

	return data
}

func SetPlugState(ip net.IP, desiredState bool, id int, currentState SwitchStatus) {

	//fmt.Printf("Checking Plug %d state\n", id)

	if currentState.Output == true && desiredState == false {
		fmt.Printf("Turning off plug %d\n", id)
		switchUrl := &url.URL{
			Scheme: "http",
			Host:   ip.String(),
			Path:   "/rpc/Switch.Set",
		}
		queryParams := url.Values{}
		queryParams.Set("id", "0")
		queryParams.Set("on", "false")
		switchUrl.RawQuery = queryParams.Encode()

		var resp, err = http.Get(switchUrl.String())
		if err != nil {
			panic(err)
		}
		defer func(Body io.ReadCloser) {
			err := Body.Close()
			if err != nil {

			}
		}(resp.Body)
	}

}

func PlugRoutine(ctx context.Context, settings plug, token string) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	fmt.Printf("Spawn of worker for plug %d\n", settings.PlugId)

	for {
		select {
		case <-ctx.Done():
			fmt.Printf("Worker for plug %d exiting\n", settings.PlugId)
			return
		case <-ticker.C:
			data := GetPlugPower(settings)
			plugData := plugPower{
				Token:       token,
				PlugId:      settings.PlugId,
				Ipaddr:      settings.Ipaddr,
				State:       data.Output,
				Voltage:     data.Voltage,
				Current:     data.Current,
				Power:       data.APower,
				TotalEnergy: data.AEnergy.Total,
			}

			event := event{
				Event: "plug_power",
				DataPayload: map[string]interface{}{
					"data": plugData,
				},
			}

			plugPowerChannel <- event
			//fmt.Println(event)
		}

	}
}

func main() {

	flag.Parse()
	log.SetFlags(0)

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	if tokenRaw == nil || *tokenRaw == "" {
		log.Fatal("-token is required")
	}

	u := url.URL{Scheme: "ws", Host: *addr, Path: "/client"}
	log.Printf("connecting to %s", u.String())

	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer c.Close()

	tokenStruct := &token{
		Token: *tokenRaw,
	}

	eventStruct := &event{
		Event:       "settings_controler",
		DataPayload: tokenStruct,
	}

	jsonToken, err := json.Marshal(eventStruct)
	if err != nil {
		log.Fatal(err)
		return
	}
	//fmt.Println(string(jsonToken))

	err = c.WriteMessage(websocket.TextMessage, jsonToken)
	if err != nil {
		log.Println("write:", err)
		return
	}

	log.Println("Connected to Plug Server\n Authenticating....")

	done := make(chan struct{})

	plugSettingsChannel := make(chan plugs)

	plugPowerChannel = make(chan event)

	go func() {
		defer close(done)
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				return
			}
			//log.Printf("recv: %s, type: %d\n", message, mt)

			eventData := event{}
			if err = json.Unmarshal(message, &eventData); err != nil {
				panic(err)
			}

			switch eventData.Event {
			case "settings_plug_info":
				dataPayloadBytes, err := json.Marshal(eventData.DataPayload)
				if err != nil {
					log.Fatalf("Error marshalling DataPayload: %v", err)
				}

				plugsData := plugs{}
				if err := json.Unmarshal(dataPayloadBytes, &plugsData); err != nil {
					log.Fatalf("Error unmarshalling DataPayload to plugs: %v", err)
				}

				//fmt.Printf("Unmarshalled plugs data: %+v\n", plugsData)

				plugSettingsChannel <- plugsData
			case "settings_controler":
				err = c.WriteMessage(websocket.TextMessage, jsonToken)
				if err != nil {
					log.Println("write:", err)
					return
				}

			default:
				log.Printf("Unknown event type: %s\n", eventData.Event)
			}

			//fmt.Println("eventType:", eventType)

		}
	}()

	//ticker := time.NewTicker(time.Second)
	//defer ticker.Stop()

	//var plugsSettings plugs

	//select {
	//case plugsSettings = <-plugSettingsChannel:
	//	fmt.Println("Received Settings successfully:", plugsSettings)
	//case <-time.After(5 * time.Second):
	//	fmt.Println("No data received timeout")
	//	os.Exit(69)
	//}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var wg sync.WaitGroup

	go func() {
		var cancelCurrent context.CancelFunc

		for {
			//fmt.Println("looping")
			select {
			case configs := <-plugSettingsChannel:
				//fmt.Println("data here")
				if cancelCurrent != nil {
					fmt.Println("Received new configuration exiting all workers...")
					cancelCurrent()
					wg.Wait() // Wait for all current goroutines to stop
				}

				localCtx, localCancel := context.WithCancel(ctx)
				cancelCurrent = localCancel

				wg.Add(len(configs.Plugs))
				for _, plugSetting := range configs.Plugs {
					//fmt.Println(plugSetting)
					go func(plugSetting plug) {
						defer wg.Done()
						PlugRoutine(localCtx, plugSetting, *tokenRaw)
					}(plugSetting)

				}
			}
		}

	}()

	//for _, plugSetting := range plugsSettings.Plugs {
	//	go PlugRoutine(ctx, plugSetting)
	//}

	for {
		select {
		case data := <-plugPowerChannel:
			jsonData, err := json.Marshal(data)
			if err != nil {
				fmt.Println("Error marshalling JSON:", err)
				os.Exit(1)
			}
			err = c.WriteMessage(websocket.TextMessage, jsonData)
			if err != nil {
				log.Println("write:", err)
				os.Exit(1)
			}
		case <-interrupt:
			fmt.Println("Shutting Down application")
			cancel()
			time.Sleep(2 * time.Second)
			os.Exit(0)
		}
	}

}
