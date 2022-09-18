import os
import json
import pdf

struct PDFTemplate {
	username string [required]
	userid string [required]
	headline string [required]
	date string [required]
	items []struct {
		artikel string [required]
		amount string [required]
		price string [required]
	} [required]
}

[console]
fn main() {
	config := os.read_lines('./config.json') or {
        panic('error reading file config.json')
        return
    }
	
	pdf_config := json.decode([]PDFTemplate, config[0]) or {
		panic(err)
		return
	}

	for i, pdf_element in pdf_config {
		current_pdf := i + 1
		println('Generating $current_pdf/$pdf_config.len: $pdf_element.username')
		genpdf(pdf_element)
	}
}

fn genpdf(template &PDFTemplate) {
	pg_fmt := pdf.page_fmt['A4']
	mut doc := pdf.Pdf{}
	doc.init()

	mut page_n := doc.create_page(pdf.Page_params{
		format: 'A4'
		gen_content_obj: true
		is_stream: true
		compress: false
	})

	mut page := &doc.page_list[page_n]

	page.user_unit = pdf.mm_unit

	mut fnt_params_headline := pdf.Text_params{
		font_size: 30.0
		font_name: 'Helvetica'
		s_color: pdf.RGB{
			r: 0
			g: 0
			b: 0
		}
		f_color: pdf.RGB{
			r: 0
			g: 0
			b: 0
		}
	}

	mut fnt_params_text := pdf.Text_params{
		font_size: 22.0
		font_name: 'Helvetica'
		s_color: pdf.RGB{
			r: 0
			g: 0
			b: 0
		}
		f_color: pdf.RGB{
			r: 0
			g: 0
			b: 0
		}
	}

	mut fnt_params_list := pdf.Text_params{
		font_size: 14.0
		font_name: 'Helvetica'
		s_color: pdf.RGB{
			r: 0
			g: 0
			b: 0
		}
		f_color: pdf.RGB{
			r: 0
			g: 0
			b: 0
		}
	}

	doc.create_linear_gradient_shader('sep_list_blue', pdf.RGB{
		r: 83 / 255.0
		g: 107 / 255.0
		b: 138 / 255.0
	}, pdf.RGB{
		r: 93 / 255.0
		g: 135 / 255.0
		b: 191 / 255.0
	}, 0)

	doc.create_linear_gradient_shader('sep_list_red', pdf.RGB{
		r: 180 / 255.0
		g: 60 / 255.0
		b: 60 / 255.0
	}, pdf.RGB{
		r: 180 / 255.0
		g: 60 / 255.0
		b: 60 / 255.0
	}, 0)

	doc.create_linear_gradient_shader('sep_list_geen', pdf.RGB{
		r: 47 / 255.0
		g: 94 / 255.0
		b: 23 / 255.0
	}, pdf.RGB{
		r: 47 / 255.0
		g: 94 / 255.0
		b: 23 / 255.0
	}, 0)

	// Read logo jpg from fs
	jpeg_data := os.read_bytes("logo.jpg") or { panic(err) }
	jpeg_id := doc.add_jpeg_resource(jpeg_data)

	// Use data
	page.use_jpeg(jpeg_id)
	page.use_shader('sep_list_blue')
	page.use_shader('sep_list_red')
	page.use_shader('sep_list_geen')

	// get width and height in pixel of the jpeg image
		_, jpg_w, jpg_h := pdf.get_jpeg_info(jpeg_data)
		jpg_h_scale := jpg_h / jpg_w

	// Declare the base (Type1 font) we want use
	if !doc.use_base_font(fnt_params_text.font_name) {
		eprintln('ERROR: Font $fnt_params_text.font_name not available!')
	}

	// Write elements to PDF
	page.push_content(
		page.draw_base_text(template.headline, 50, 18, fnt_params_headline)
	)

	page.push_content(
		page.draw_base_text(template.username, 50, 28, fnt_params_text)
	)

	page.push_content(
		page.draw_base_text(template.date, 170, 8, fnt_params_text)
	)

	page.push_content(
		page.draw_jpeg(jpeg_id, pdf.Box{x:2, y:35, w:30, h:35 * jpg_h_scale})
	)

	// Draw table
	mut page_index := 0
	mut new_page := false
	for i, item in template.items {
		mut y := 0
		if i == 0 {
			y = 45
			page.use_shader('sep_list_red')
			page.push_content(page.draw_gradient_box('sep_list_red', pdf.Box{
				x: 8
				y: y+1
				w: 194
				h: 0.5
			}, 10))
		} else {
			if page_index > 0 {
				y = 50 + ((i * 6) - (page_index * 255))
			} else {
				y = 50 + (i * 6)
			}
		}

		if i >= (template.items.len - 3) {
			y += 6
			if i == (template.items.len - 3) {
				page.use_shader('sep_list_geen')
				page.push_content(page.draw_gradient_box('sep_list_geen', pdf.Box{
					x: 8
					y: y - 7
					w: 194
					h: 1.5
				}, 10))
			}
		}

		//Start putting content on the page with updated y
		if new_page {
			page.use_shader('sep_list_red')
			y = y - 5
			page.push_content(page.draw_gradient_box('sep_list_red', pdf.Box{
				x: 8
				y: y+1
				w: 194
				h: 0.5
			}, 10))

			fnt_params_list.text_align = .left

			page.text_box(template.items[0].artikel, pdf.Box{
				x: 10
				y: y - 5
				w: 160 - 10
				h: 4
			}, fnt_params_list)

			page.text_box(template.items[0].amount, pdf.Box{
				x: 155
				y: y - 5
				w: 180 - 155
				h: 4
			}, fnt_params_list)

			fnt_params_list.text_align = .right

			page.text_box(template.items[0].price, pdf.Box{
				x: 185
				y: y - 5
				w: 200 - 185
				h: 4
			}, fnt_params_list)

			new_page = false //Set it to false because we are done with drawing new page stuff
			continue
		} else if i != 0 {
			// If I decide to skip line  i could do it here, this could become usefull if artikels are too long and need spliting
			if i != (template.items.len - 4) {
				page.push_content(page.draw_gradient_box('sep_list_blue', pdf.Box{
					x: 8
					y: y+1
					w: 194
					h: 0.5
				}, 10))
			}
		}

		fnt_params_list.text_align = .left
		page.text_box(item.artikel, pdf.Box{
			x: 10
			y: y - 5
			w: 160 - 10
			h: 4
		}, fnt_params_list)

		page.text_box(item.amount, pdf.Box{
			x: 155
			y: y - 5
			w: 180 - 155
			h: 4
		}, fnt_params_list)

		fnt_params_list.text_align = .right
		page.text_box(item.price, pdf.Box{
			x: 185
			y: y - 5
			w: 200 - 185
			h: 4
		}, fnt_params_list)

		// Dynamic new page dedection
		if y > (pg_fmt.h - 20) {
			page_index = page_index + 1
			new_page = true
			page_n = doc.create_page(pdf.Page_params{
				format: 'A4'
				gen_content_obj: true
				compress: true
			})
			page = &doc.page_list[page_n]
			page.use_shader('sep_list_blue')
			
		}
	}

	// render the footers
	mut index := 0
	for index < doc.page_list.len {
		mut page_f := &doc.page_list[index]
		//----- Footer -----
		footer := 'Page ${index + 1} of $doc.page_list.len'
		fnt_params_list.text_align = .right
		page_f.text_box(footer, pdf.Box{
			x: 10
			y: pg_fmt.h - 10
			w: pg_fmt.w - 20
			h: 20
		}, fnt_params_list)

		index++
	}

	// render the PDF
	mut txt := doc.render() or {
		eprintln('ERROR: Doc.Render!')
		exit(1)
	}

	os.write_file_array('$template.username' + '_' + '$template.userid' + '_invoice.pdf', txt) or {
		eprintln('ERROR: Doc.Render!')
	}
}