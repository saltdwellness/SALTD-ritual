
# SALTD Ritual Shopify Theme (FINAL ZIP LIST)

Follow these steps exactly to ensure the "404" and "Navbar" issues are solved.

### 📁 REQUIRED FOLDER STRUCTURE:
Your `.zip` file must look like this:

- **layout/**
  - `theme.liquid`
- **sections/**
  - `header.liquid`
  - `footer.liquid`
  - `hero.liquid`
  - `main-collection.liquid`
  - `main-product.liquid`
  - `main-page.liquid`
  - `main-404.liquid`
- **templates/**
  - `index.json`
  - `collection.json`
  - `product.json`
  - `page.json`
  - `404.json`
  - **customers/** (folder inside templates)
    - `account.liquid`
    - `login.liquid`
    - `register.liquid`

### 🚀 POST-UPLOAD CONFIGURATION:
1. **Navigation Menu**: In Shopify Admin, go to **Online Store > Navigation**. Ensure you have a menu called "Main Menu".
2. **Assign Menu**: In the Theme Customizer, click on the **Header** section and make sure "Main Menu" is selected.
3. **Account Activation**: Ensure Customer Accounts are set to "Required" or "Optional" in **Settings > Checkout > Customer accounts**.

This code uses Tailwind CSS via CDN and Inter Google Fonts for a premium look without needing a build step.
