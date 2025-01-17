require('module-alias/register');
// Importing page
const BOBasePage = require('@pages/BO/BObasePage');
const productsPage = require('@pages/BO/catalog/productsV2');

/**
 * Products V2 page, contains functions that can be used on the page
 * @class
 * @extends BOBasePage
 */
class Products extends BOBasePage {
  /**
   * @constructs
   * Setting up texts and selectors to use on products V2 page
   */
  constructor() {
    super();

    this.pageTitle = 'Products';

    // Header selectors
    this.productNameInput = '#product_header_name_1';
    this.productActiveSwitchButton = '#product_header_active_1';

    // Selectors in description tab
    this.descriptionTabLink = '#product_description-tab-nav';
    this.productSummary = '#product_description_description_short';
    this.productdescription = '#product_description_description';

    // Selectors in details tab
    this.detailsTabLink = '#product_specifications-tab-nav';
    this.productReferenceInput = '#product_specifications_references_reference';

    // Selectors in stocks tab
    this.stocksTabLink = '#product_stock-tab-nav';
    this.productQuantityInput = '#product_stock_quantities_delta_quantity_delta';
    this.productMinimumQuantityInput = '#product_stock_quantities_minimal_quantity';

    // Selectors in pricing tab
    this.pricingTabLink = '#product_pricing-tab-nav';
    this.retailPriceInput = '#product_pricing_retail_price_price_tax_excluded';
    this.taxRuleSpan = '#select2-product_pricing_retail_price_tax_rules_group_id-container';
    this.taxRuleList = 'ul#select2-product_pricing_retail_price_tax_rules_group_id-results';
    this.taxRuleSelect = taxRuleID => `${this.taxRuleList} li[id*='-${taxRuleID}']`;

    // Footer selectors
    this.previewProductButton = '#product_footer_preview';
    this.saveProductButton = '#product_footer_save';
    this.deleteProductButton = '#product_footer_delete';

    // Footer modal
    this.deleteProductFooterModal = '#delete-product-footer-modal';
    this.deleteProductSubmitButton = `${this.deleteProductFooterModal} button.btn-confirm-submit`;
  }

  /*
  Methods
   */

  /**
   * Set value on tinyMce textarea
   * @param page {Page} Browser tab
   * @param selector {string} Value of selector to use
   * @param value {string} Text to set on tinymce input
   * @returns {Promise<void>}
   */
  async setValueOnTinymceInput(page, selector, value) {
    // Select all
    await page.click(`${selector} .mce-edit-area`, {clickCount: 3});

    // Delete all text
    await page.keyboard.press('Backspace');

    // Fill the text
    await page.keyboard.type(value);
  }

  /**
   * Set product description
   * @param page {Page} Browser tab
   * @param productData {ProductData} Data to set in description form
   * @returns {Promise<void>}
   */
  async setProductDescription(page, productData) {
    await this.waitForSelectorAndClick(page, this.descriptionTabLink);

    await this.setValueOnTinymceInput(page, this.productSummary, productData.summary);
    await this.setValueOnTinymceInput(page, this.productdescription, productData.description);
  }

  /**
   * Set product details
   * @param page {Page} Browser tab
   * @param productData {ProductData} Data to set in details form
   * @returns {Promise<void>}
   */
  async setProductDetails(page, productData) {
    await this.waitForSelectorAndClick(page, this.detailsTabLink);
    await this.setValue(page, this.productReferenceInput, productData.reference);
  }

  /**
   * Set product stock
   * @param page {Page} Browser tab
   * @param productData {ProductData} Data to set in stock form
   * @returns {Promise<void>}
   */
  async setProductStock(page, productData) {
    await this.waitForSelectorAndClick(page, this.stocksTabLink);
    await this.setValue(page, this.productQuantityInput, productData.quantity);
    await this.setValue(page, this.productMinimumQuantityInput, productData.minimumQuantity);
  }

  /**
   * Set product pricing
   * @param page {Page} Browser tab
   * @param productData {ProductData} Data to set in pricing form
   * @returns {Promise<void>}
   */
  async setProductPricing(page, productData) {
    await this.waitForSelectorAndClick(page, this.pricingTabLink);
    await this.setValue(page, this.retailPriceInput, productData.price);
    // Select tax rule by ID
    await Promise.all([
      this.waitForSelectorAndClick(page, this.taxRuleSpan),
      this.waitForVisibleSelector(page, this.taxRuleList),
    ]);
    await this.waitForSelectorAndClick(page, this.taxRuleSelect(productData.taxRuleID));
  }

  /**
   * Save product
   * @param page {Page} Browser tab
   * @returns {Promise<string>}
   */
  async saveProduct(page) {
    await this.clickAndWaitForNavigation(page, this.saveProductButton);

    return this.getAlertSuccessBlockParagraphContent(page);
  }

  /**
   * Get save button name
   * @param page {Page} Browser tab
   * @returns {Promise<string>}
   */
  async getSaveButtonName(page) {
    return this.getTextContent(page, this.saveProductButton);
  }

  /**
   * Set product
   * @param page {Page} Browser tab
   * @param productData {ProductData} Data to set in new product page
   * @returns {Promise<string>}
   */
  async setProduct(page, productData) {
    await this.setValue(page, this.productNameInput, productData.name);

    await this.setProductDescription(page, productData);

    await this.setProductDetails(page, productData);

    await this.setProductStock(page, productData);

    await this.setProductPricing(page, productData);

    await this.setChecked(page, this.productActiveSwitchButton, productData.status);

    return this.saveProduct(page);
  }

  /**
   * Preview product in new tab
   * @param page {Page} Browser tab
   * @return page opened
   */
  async previewProduct(page) {
    const newPage = await this.openLinkWithTargetBlank(page, this.previewProductButton, 'body a');
    const textBody = await this.getTextContent(newPage, 'body');

    if (textBody.includes('[Debug] This page has moved')) {
      await this.clickAndWaitForNavigation(newPage, 'a');
    }
    return newPage;
  }

  /**
   * Delete product
   * @param page {Page} Browser tab
   * @returns {Promise<string>}
   */
  async deleteProduct(page) {
    await this.waitForSelectorAndClick(page, this.deleteProductButton);
    await this.waitForVisibleSelector(page, this.deleteProductFooterModal);
    await this.clickAndWaitForNavigation(page, this.deleteProductSubmitButton);

    return productsPage.getAlertSuccessBlockParagraphContent(page);
  }
}

module.exports = new Products();
