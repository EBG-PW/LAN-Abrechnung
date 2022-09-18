import os
import json
import pdf

struct PDFTemplate {
	headline string [required]
	username string [required]
	items []struct {
		name string [required]
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
		panic('Failed to parse json')
		return
	}

	for i, pdf_element in pdf_config {
		current_pdf := i + 1
		println('Generating $current_pdf/$pdf_config.len')
		genpdf(pdf_element)
	}
}

fn genpdf(template &PDFTemplate) {
	mut doc := pdf.Pdf{}
	doc.init()

	page_n := doc.create_page(pdf.Page_params{
		format: 'A4'
		gen_content_obj: true
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

	// Read logo jpg from fs
	jpeg_data := os.read_bytes("logo.jpg") or { panic(err) }
	jpeg_id := doc.add_jpeg_resource(jpeg_data)
	page.use_jpeg(jpeg_id)

	// get width and height in pixel of the jpeg image
		_, jpg_w, jpg_h := pdf.get_jpeg_info(jpeg_data)
		jpg_h_scale := jpg_h / jpg_w

	// Declare the base (Type1 font) we want use
	if !doc.use_base_font(fnt_params_text.font_name) {
		eprintln('ERROR: Font $fnt_params_text.font_name not available!')
	}

	// Write elements to PDF
	page.push_content(
		page.draw_base_text(template.username, 85, 30, fnt_params_text)
	)

	page.push_content(
		page.draw_base_text(template.headline, 75, 20, fnt_params_headline)
	)

	page.push_content(
		page.draw_jpeg(jpeg_id, pdf.Box{x:2, y:35, w:30, h:35 * jpg_h_scale})
	)

	// render the PDF
	mut txt := doc.render() or {
		eprintln('ERROR: Doc.Render!')
		exit(1)
	}

	os.write_file_array('$template.username' + '_invoice.pdf', txt) or {
		eprintln('ERROR: Doc.Render!')
	}
}