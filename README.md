# Perfect Bearing Website

A modern, responsive e-commerce catalog website for **Perfect Bearing**, a leading exporter of industrial bearings. This project showcases a wide range of bearing products with a premium, user-friendly interface.

## 🚀 Features

-   **Dynamic Product Catalog**: Browse products by category (`type.html`) or view detailed specifications (`bearing.html`) populated dynamically from a JSON database (`latest db 1.json`).
-   **Smart Search**: Real-time autocomplete search bar to quickly find bearing models.
-   **Dark/Light Mode**: Fully supported theme toggling with a persistent state saved in local storage.
-   **Responsive Design**: Mobile-first approach ensuring a seamless experience across all devices (Desktop, Tablet, Mobile).
-   **Interactive UI**:
    -   Smooth scrolling navigation.
    -   "Back to Top" button (smart visibility).
    -   Animated brand strip (marquee) displaying partner/brand logos.
-   **Contact Integration**: Functional contact form powered by **EmailJS** and direct WhatsApp inquiry links on product pages.
-   **Analytics**: Integrated Google Analytics 4 (GA4) for visitor tracking.

## 🛠️ Tech Stack

-   **Frontend**: HTML5, CSS3, JavaScript (Vanilla key features, no heavy framework).
-   **Data**: JSON (`latest db 1.json`) for the product database.
-   **Libraries**:
    -   [FontAwesome](https://fontawesome.com/) (Icons)
    -   [EmailJS](https://www.emailjs.com/) (Contact Form)
    -   [Google Fonts](https://fonts.google.com/) (Inter)

## 📂 Project Structure

```
perfect-bearing/
├── index.html          # Homepage (Hero, Categories, About, Contact)
├── type.html           # Category view (Filters products by type)
├── bearing.html        # Product detail view (Specs, Image, Inquiry)
├── styles.css          # Main stylesheet (Variables, Dark mode, Layout)
├── script.js           # Core logic (Search, Theme, Data Fetching, UI)
├── latest db 1.json    # Product Database
├── photos/             # Product images and assets
└── brand/              # Brand logos for the marquee strip
```

## 🔧 Setup & Usage

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/sarjanshah14/PerfectBearing.git
    ```
2.  **Run locally:**
    -   Since the project fetches data from a JSON file using `fetch()`, you need a local server to avoid CORS/Protocol errors (browsers often block `fetch` on `file://` protocol).
    -   **Using Python:**
        ```bash
        python3 -m http.server
        ```
    -   **Using VS Code:** Install the "Live Server" extension and click "Go Live".

## 📝 License

All rights reserved © 2024 Perfect Bearing.
