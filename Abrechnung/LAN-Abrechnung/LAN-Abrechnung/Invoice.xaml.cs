using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using System.Data;
using System.Globalization;

namespace LAN_Abrechnung
{
    /// <summary>
    /// Interaktionslogik für Invoice.xaml
    /// </summary>
    public partial class Invoice : Window
    {
        public Invoice()
        {
            InitializeComponent();

            




        }

        private void getUserData(string username)
        {
            DataSet dataShowTable = new DataSet();

            dataShowTable = MainWindow.GetData("SELECT SUM(shopinglist.bought) \"STK\", shopinglist.produktname AS \"Produktname\", shopinglist.produktcompany AS \"Hersteller\", (SUM(shopinglist.price)/SUM(shopinglist.bought)) AS \"Preis pro Stück\", SUM(shopinglist.price) AS \"Summe\" FROM shopinglist INNER JOIN guests ON shopinglist.userid = guests.userid WHERE guests.username = '" + username + "' GROUP BY (shopinglist.produktname,shopinglist.produktcompany) ORDER BY shopinglist.produktname ASC");


            FrontTable.ItemsSource = dataShowTable.Tables[0].DefaultView;
        }

        private void GetData_OnClick(object sender, RoutedEventArgs e)
        {

            int selectedItem = Username.SelectedIndex;
            DataRowView usernameDataContext = Username.SelectedItem as DataRowView;
            getUserData(usernameDataContext.Row.ItemArray[0].ToString());
        }

        private void Username_OnDropDownOpened(object sender, EventArgs e)
        {
            DataSet usernameDataSet = new DataSet();

            usernameDataSet = MainWindow.GetData("SELECT username, userid FROM guests");

            DataTable userDataTable = usernameDataSet.Tables[0];
            Username.ItemsSource = userDataTable.DefaultView;
            Username.DisplayMemberPath = userDataTable.Columns["username"].ToString();
            Username.SelectedValuePath = userDataTable.Columns["userid"].ToString();
        }
    }
}
