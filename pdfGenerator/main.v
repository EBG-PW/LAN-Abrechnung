import pdf
import os

fn main() {
	mut user := 'BolverBlitz'
	mut headline := 'Abrechnung'

	for i := 1; i <= 200; i++ {
		genpdf(user, headline, 'pdf_' + i.str() + '.pdf')
	}
	
}

fn genpdf(user string, headline string, filename string) {
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
		page.draw_base_text(user, 85, 30, fnt_params_text)
	)

	page.push_content(
		page.draw_base_text(headline, 75, 20, fnt_params_headline)
	)

	page.push_content(
		page.draw_jpeg(jpeg_id, pdf.Box{x:2, y:35, w:30, h:35 * jpg_h_scale})
	)

	// render the PDF
	txt := doc.render() or {
		eprintln('ERROR: Doc.Render!')
		exit(1)
	}

	os.write_file_array(filename, txt) or {
		eprintln('ERROR: Doc.Render!')
	}
}