<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&duration=2800&pause=900&color=F59E0B&center=true&vCenter=true&width=850&lines=JEE+%26+NEET+Study+Hub;Learn.+Practice.+Revise.+Repeat.;Free+student-focused+study+tools" alt="Animated typing banner: JEE and NEET Study Hub" />

<p><strong>A free, responsive study hub by MasterClass</strong></p>

<p>
  <a href="https://icse-cbse-10-12.github.io/jee-neet-prep/"><img alt="Live website" src="https://img.shields.io/badge/Live%20Website-Visit%20Now-0A192F?style=for-the-badge&logo=githubpages&logoColor=white"></a>
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge">
  <img alt="Static site" src="https://img.shields.io/badge/Hosting-Static%20%7C%20GitHub%20Pages-2563EB?style=for-the-badge">
</p>

<p><em>One place to organise study resources, practise questions, and track revision.</em></p>

</div>

---

## ✨ Features

- 📚 **Subject-wise study resources** with a shared responsive interface.
- 🔎 **Search and filters** on the homepage and subject pages.
- 🗓️ **Chapter-wise campaign plans** with tickable study tasks.
- 🧠 **Revision notes and concept maps** where available in the data.
- ✅ **MCQ practice** with answer checking, explanations, scores, and mixed quick practice.
- 💾 **Local progress tracking** in the browser — no account or backend required.
- 📱 **Responsive layout** for desktop and mobile screens.
- ♿ **Accessibility-minded details**, including keyboard focus states and reduced-motion support.

## 🌐 Try it

**[Open the live JEE & NEET Study Hub →](https://icse-cbse-10-12.github.io/jee-neet-prep/)**

## 📦 Content overview

| Data file | Included content |
|---|---|
| data/biology.json | 32 chapters, campaign tasks, and 448 embedded practice questions |
| data/chemistry-campaign.json | 10 chapters, campaign tasks, and 280 embedded practice questions |
| data/chemistry-mcqs.json | 17 modules and 1,700 MCQs |
| data/maths.json | 30 modules, revision material, and 3,000 questions |
| data/physics.json | 28 chapters, campaign tasks, and 498 embedded practice questions |

The interface, navigation, interaction model, and data schema are newly built to organise the supplied study resources. Availability of notes or concept maps varies by module.

## 🚀 Run locally

You need **Node.js 20 or newer** for the repository's validation commands. To preview the static site, use any local static server.

1. Clone or download this repository.
   ```bash
   git clone https://github.com/icse-cbse-10-12/jee-neet-prep.git
   cd jee-neet-prep
   ```
2. Start a local static server, for example with the VS Code **Live Server** extension.
3. Open the local URL shown by the server.

> Do not open index.html directly as a file:// URL: the site loads its subject data with fetch(), which needs a local server. GitHub Pages serves it correctly as a static website.

## 🧪 Validate the project

From the repository root, run:

```bash
node --check assets/app.js
node scripts/validate-data.mjs
```

GitHub Actions also runs checks on pushes and pull requests. The data validator checks JSON structure, expected group/question counts, question text, option arrays, answer indices, explanations, local page assets, and homepage subject routes. Duplicate prompts and answer choices may be reported for review.

## 🗂️ Project structure

```text
.
├── index.html
├── study.html
├── assets/
│   ├── app.js
│   └── styles.css
├── data/
│   ├── biology.json
│   ├── chemistry-campaign.json
│   ├── chemistry-mcqs.json
│   ├── maths.json
│   └── physics.json
├── scripts/
│   └── validate-data.mjs
├── README.md
└── LICENSE
```

## ⚠️ Academic accuracy and content rights

This is a study aid, not an official JEE/NEET service. **Content accuracy and complete coverage of the latest official syllabi have not been independently certified.** Automated checks can detect structural problems but cannot prove that every scientific explanation, calculation, or answer is correct. Check current official syllabi and verify answers before relying on them for exam preparation.

Questions and revision points are organised from supplied study resources and may include generated practice questions. Unless an item is explicitly identified and verified as a previous-year question, do not treat it as an official PYQ.

The MIT License in this repository applies to the project's original code and other material owned by the repository copyright holder. Third-party educational questions, module pages, logos, and other source material may be subject to separate copyright or licence terms; the MIT License does **not** grant rights to redistribute them. Obtain permission before republishing third-party copyrighted content.

## 🌐 Connect with MasterClass

- **Telegram community:** https://t.me/masterclass11nd12
- **YouTube channel:** https://www.youtube.com/@MasterClass11and12

## 🤝 Contributing

Suggestions and fixes are welcome. Please include the affected file or topic and, for educational corrections, a reliable source or worked solution. Run the validation commands before submitting a pull request.

## 📄 License

The project's original code is licensed under the **MIT License** — see [LICENSE](LICENSE). Third-party materials remain subject to their own terms.

---

<div align="center">

Made for learners by **MasterClass** 📘

[Study Hub](https://icse-cbse-10-12.github.io/jee-neet-prep/) ·
[Report an issue](https://github.com/icse-cbse-10-12/jee-neet-prep/issues)

</div>
