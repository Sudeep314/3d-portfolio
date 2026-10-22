PUT YOUR FILES IN THIS FOLDER
==============================

  profile.jpg   -> your photo (square works best, 400x400 or larger)
  resume.pdf    -> OPTIONAL. Only needed if you make a real PDF resume.

The names must match exactly what is written in  js/content.js :

  profile.photo  = "assets/profile.jpg"
  profile.resume = "assets/resume.pdf"

If a file is missing:
  - the photo box in the About panel simply hides itself
  - the "Download PDF" button in the Resume panel hides itself, and the
    printable resume page at  ../resume.html  is used instead

You do NOT need a PDF.
Open  resume.html  and click "Print / Save as PDF" — the browser turns that
page into a one-page A4 PDF for you, using the same js/content.js data.
