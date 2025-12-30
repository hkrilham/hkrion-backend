import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Businesses } from './collections/Businesses'
import { BusinessLocations } from './collections/BusinessLocations'
import { Categories } from './collections/Categories'
import { Brands } from './collections/Brands'
import { Products } from './collections/Products'
import { Contacts } from './collections/Contacts'
import { Sales } from './collections/Sales'
import { Purchases } from './collections/Purchases'
import { Expenses } from './collections/Expenses'
import { ExpenseCategories } from './collections/ExpenseCategories'
import { CustomerGroups } from './collections/CustomerGroups'
import { AboutPageCMS } from './collections/AboutPageCMS'
import { Achievements } from './collections/Achievements'
import { BankAccounts } from './collections/BankAccounts'
import { BankTransferOrders } from './collections/BankTransferOrders'
import { BusinessDomains } from './collections/BusinessDomains'
import { BusinessLabelSettings } from './collections/BusinessLabelSettings'
import { BusinessLabelTemplates } from './collections/BusinessLabelTemplates'
import { BusinessPaymentMethods } from './collections/BusinessPaymentMethods'
import { BusinessSettings } from './collections/BusinessSettings'
import { BusinessSubscriptions } from './collections/BusinessSubscriptions'
import { BusinessTrialUsage } from './collections/BusinessTrialUsage'
import { ContactFAQs } from './collections/ContactFAQs'
import { ContactInfo } from './collections/ContactInfo'
import { ContactPageCMS } from './collections/ContactPageCMS'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { SellingPriceGroups } from './collections/SellingPriceGroups'
import { Units } from './collections/Units'
import { Warranties } from './collections/Warranties'
import { SubscriptionPackages } from './collections/SubscriptionPackages'
import { GlobalPaymentMethods } from './collections/GlobalPaymentMethods'
import { Coupons } from './collections/Coupons'
import { Countries } from './collections/Countries'
import { CountryCodes } from './collections/CountryCodes'
import { Currencies } from './collections/Currencies'
import { Discounts } from './collections/Discounts'
import { DiscountProducts } from './collections/DiscountProducts'
import { HomepageCMS } from './collections/HomepageCMS'
import { LabelPrintHistory } from './collections/LabelPrintHistory'
import { OfficeLocations } from './collections/OfficeLocations'
import { OpeningStock } from './collections/OpeningStock'
import { PackageFeatures } from './collections/PackageFeatures'
import { PermissionRequests } from './collections/PermissionRequests'
import { Permissions } from './collections/Permissions'
import { Prefixes } from './collections/Prefixes'
import { ProductImeiSerial } from './collections/ProductImeiSerial'
import { ProductLocations } from './collections/ProductLocations'
import { ProductStockPrice } from './collections/ProductStockPrice'
import { PurchaseItems } from './collections/PurchaseItems'
import { PurchaseReturnItems } from './collections/PurchaseReturnItems'
import { PurchaseReturns } from './collections/PurchaseReturns'
import { ReturnItems } from './collections/ReturnItems'
import { RolePermissions } from './collections/RolePermissions'
import { SaleItems } from './collections/SaleItems'
import { SalePayments } from './collections/SalePayments'
import { SalesCommissionAgents } from './collections/SalesCommissionAgents'
import { SalesReturns } from './collections/SalesReturns'
import { SeoAnalytics } from './collections/SeoAnalytics'
import { SeoIssues } from './collections/SeoIssues'
import { SeoKeywords } from './collections/SeoKeywords'
import { SeoPages } from './collections/SeoPages'
import { SeoSettings } from './collections/SeoSettings'
import { SiteSettings } from './collections/SiteSettings'
import { StockAdjustmentHistory } from './collections/StockAdjustmentHistory'
import { StockAdjustmentItems } from './collections/StockAdjustmentItems'
import { StockAdjustments } from './collections/StockAdjustments'
import { StockTransferItemImeis } from './collections/StockTransferItemImeis'
import { StockTransferItems } from './collections/StockTransferItems'
import { StockTransfers } from './collections/StockTransfers'
import { SubscriptionFeatures } from './collections/SubscriptionFeatures'
import { SubscriptionHistory } from './collections/SubscriptionHistory'
import { SubscriptionPayments } from './collections/SubscriptionPayments'
import { SubscriptionPlans } from './collections/SubscriptionPlans'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Businesses,
    BusinessLocations,
    Categories,
    Brands,
    Products,
    Contacts,
    Sales,
    Purchases,
    Expenses,
    ExpenseCategories,
    CustomerGroups,
    AboutPageCMS,
    Achievements,
    BankAccounts,
    BankTransferOrders,
    BusinessDomains,
    BusinessLabelSettings,
    BusinessLabelTemplates,
    BusinessPaymentMethods,
    BusinessSettings,
    BusinessSubscriptions,
    BusinessTrialUsage,
    ContactFAQs,
    ContactInfo,
    ContactPageCMS,
    ContactSubmissions,
    SellingPriceGroups,
    Units,
    Warranties,
    SubscriptionPackages,
    GlobalPaymentMethods,
    Coupons,
    Countries,
    CountryCodes,
    Currencies,
    Discounts,
    DiscountProducts,
    HomepageCMS,
    LabelPrintHistory,
    OfficeLocations,
    OpeningStock,
    PackageFeatures,
    PermissionRequests,
    Permissions,
    Prefixes,
    ProductImeiSerial,
    ProductLocations,
    ProductStockPrice,
    PurchaseItems,
    PurchaseReturnItems,
    PurchaseReturns,
    ReturnItems,
    RolePermissions,
    SaleItems,
    SalePayments,
    SalesCommissionAgents,
    SalesReturns,
    SeoAnalytics,
    SeoIssues,
    SeoKeywords,
    SeoPages,
    SeoSettings,
    SiteSettings,
    StockAdjustmentHistory,
    StockAdjustmentItems,
    StockAdjustments,
    StockTransferItemImeis,
    StockTransferItems,
    StockTransfers,
    SubscriptionFeatures,
    SubscriptionHistory,
    SubscriptionPayments,
    SubscriptionPlans,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
