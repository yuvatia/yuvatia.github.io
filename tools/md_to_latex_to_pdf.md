All notes are written in Markdown, and are then fed to Pandoc to export latex/pdf, using the Eisvogel template (https://github.com/Wandmalfarbe/pandoc-latex-template)

1. Extract Eisvogel.zip to a folder
2. cp eisvogel.latex ~/.local/share/pandoc/templates
3. Run


```bash
pandoc example.md -f markdown  -t latex -o example.tex
```

or

```bash
pandoc example.md -o example.pdf --from markdown --template eisvogel --listings
```

(-t == --to and -f == --from)

Note: atm I'm using pandoc to export to latex by running

```bash
pandoc example.md -o example.tex -f markdown -t latex --template eisvogel --listings
```

And then use https://texviewer.herokuapp.com/ to compile to PDF and save

Modifications to template:
```
\usepackage{algorithmic}
```

then remove listing tag and add  \begin{algorithmic}[1] to algorithmic begins to add lines numbering

 890 \usepackage{algorithmic}
 891 \usepackage{algpseudocode}          