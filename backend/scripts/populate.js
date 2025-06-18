require('dotenv').config();
const mongoose = require('mongoose');
const Example = require('../models/Example');
const { getEmbedding } = require('../services/embeddings');

const examples = 
 [
    {
      "question": "What documents are required to export spices from India to the US?",
      "answer": "To export spices from India to the US, the following documents are generally required: IEC (Import Export Code), FSSAI License, Spice Board Registration, Phytosanitary Certificate, US FDA Registration, Commercial Invoice & Packing List, Shipping Bill, Bill of Lading or Airway Bill, Certificate of Origin, and any other certificate mandated by the buyer or US customs."
    },
    {
      "question": "Do I need an IEC (Import Export Code) to import electronics into India?",
      "answer": "Yes, IEC is mandatory to import any goods into India, including electronics. You can apply online via https://www.dgft.gov.in. No physical document submission is required."
    },
    {
      "question": "Is BIS certification mandatory for importing toys into India?",
      "answer": "Yes, BIS (Bureau of Indian Standards) certification is mandatory for importing toys into India. As per the Quality Control Order (QCO) issued by DPIIT, toys must comply with IS 9873 and IS 15644 standards and bear the ISI mark. Uncertified toys will be prohibited from import, and customs will reject clearance."
    },
    {
      "question": "What is the current import duty on LED lights from China to India?",
      "answer": "As of now, the typical duties on LED lights imported from China are: Basic Customs Duty (BCD): 10–15%, IGST: 18%, Social Welfare Surcharge (SWS): 10% on BCD. In some cases, Anti-Dumping Duty may apply (based on type and HS code). Note: Exact rates depend on the HS code of the product. For accurate duty, consult the ICEGATE Customs Duty Calculator."
    },
    {
      "question": "Can I export food products from India without FSSAI approval?",
      "answer": "No, FSSAI approval is mandatory for exporting any food items from India. You must obtain a valid FSSAI License (Export category) and ensure labelling, safety, and packaging compliance with FSSAI norms. For certain items (e.g., meat, seafood), additional regulatory clearance (e.g. APEDA) may be needed."
    },
    {
      "question": "What are India's current trade agreements with the UK?",
      "answer": "As of 2025, India and the UK are in the final stages of ratifying a Comprehensive Free Trade Agreement (FTA). While not fully in force yet, several rounds of negotiation have concluded, covering tariff reductions on textiles, tea, cars, and whisky, easier market access for services, and GSP preferences have ended post-Brexit."
    },
    {
      "question": "Can I import gold from UAE without customs duty?",
      "answer": "No, you cannot import gold from the UAE without duty. However, under the India-UAE CEPA, there is a tariff quota (TRQ) system that allows eligible importers (like nominated agencies) to import gold at a concessional duty (around 1%) for specified quantities."
    },
    {
      "question": "What items are banned from export in India as of 2025?",
      "answer": "Items prohibited from export include narcotics & psychotropic substances, wildlife & endangered species (CITES), certain types of sand, soil, and rare minerals, human organs and blood, currency notes & coins, and recently (2024–25): non-Basmati rice, wheat, and certain medicines (due to domestic supply concerns). Always refer to the DGFT Export Policy Schedule 2 for the latest."
    },
    {
      "question": "Which countries offer duty-free access for Indian garments?",
      "answer": "Countries like the EU (under GSP+), UAE (under CEPA), Australia (under the India-Australia ECTA), and the UK (pending finalization of India-UK FTA) offer duty-free or preferential access to Indian garments."
    },
    {
      "question": "What is the cheapest shipping method for small parcels from India to Europe?",
      "answer": "For small parcels (under 2–30 kg), the cheapest options typically are India Post EMS (Speed Post), courier aggregators (e.g. Shiprocket, iThink Logistics, Pickrr), and Postal Export Clearance (PECP) under simplified documentation from India Post. Tip: Use postal for under ₹10,000 declared value; switch to express for faster customs clearance."
    },
    {
      "question": "How do I track my container using the bill of lading?",
      "answer": "Use the Bill of Lading (BoL) number to track your container by visiting the shipping line's website (e.g. MSC, Maersk, CMA CGM) and entering the BoL number in the 'Track & Trace' section. It shows container location, vessel name, port dates (departure/arrival), ETD & ETA. You can also use global platforms like https://www.track-trace.com/container and https://www.cargotrack.in."
    },
    {
      "question": "What is the difference between FOB and CIF in international trade?",
      "answer": "FOB (Free on Board) means the seller delivers goods to the port and the buyer pays for freight and insurance. CIF (Cost, Insurance, and Freight) means the seller pays for transportation and insurance up to the destination port. FOB is buyer-friendly (control + cost); CIF is seller-friendly (includes logistics up to destination port)."
    },
    {
      "question": "How do Incoterms affect shipping responsibilities and risk?",
      "answer": "Incoterms (International Commercial Terms) define who pays for shipping, insurance, loading/unloading, where risk transfers from seller to buyer, and what documents are required. For example, EXW: Buyer bears full risk from seller's gate, DDP: Seller handles everything till buyer's door, including duties. Use Incoterms correctly in contracts to avoid disputes on damage, cost, and insurance."
    },
    {
      "question": "How long does sea freight take from Mumbai to Hamburg?",
      "answer": "Sea freight transit time from Mumbai (JNPT/Nhava Sheva) to Hamburg (Germany): Direct (FCL): ~24–28 days, Transshipment (via Colombo/Singapore): 30–35 days, LCL (Consolidated cargo): May take up to 40–45 days due to stuffing, routing delays. Add 3–7 days for port handling, customs clearance, and trucking."
    },
    {
      "question": "What is the GST on export of services in India?",
      "answer": "Export of services is treated as a zero-rated supply under GST. This means GST = 0%. You can export without payment of IGST under LUT (Letter of Undertaking) or export with IGST payment, then claim refund on that amount. LUT is preferred as it avoids blocking working capital."
    },
    {
      "question": "Is there any export incentive under RoDTEP for textiles in 2025?",
      "answer": "Yes. As of 2025, RoDTEP (Remission of Duties and Taxes on Exported Products) continues to be available for most textile items, including cotton garments, synthetic apparel, and made-ups. Rates vary by HS code and range from 0.5% to 4% of FOB value. Check the latest RoDTEP Rate Schedule on https://icegate.gov.in or DGFT."
    },
    {
      "question": "How do I calculate customs duty on imported mobile phones in India?",
      "answer": "Mobile phones fall under HS Code 8517.12. As of 2025, applicable duties are Basic Customs Duty (BCD): 20%, Social Welfare Surcharge (SWS): 10% of BCD, IGST: 18% on assessable value incl. BCD + SWS. Example Calculation: If phone CIF value = ₹10,000, BCD = ₹2,000, SWS = ₹200, IGST = 18% of ₹12,200 = ₹2,196, Total Duty = ₹4,396 (~44%). Use ICEGATE's Duty Calculator for exact HS-code-based calculation."
    },
    {
      "question": "What are anti-dumping duties and how are they applied?",
      "answer": "Anti-dumping duty (ADD) is imposed when imported goods are sold below fair market value, harming domestic industry. It is levied by DGTR (Directorate General of Trade Remedies), based on country, product, and HS code, and usually applies to items like steel, chemicals, electronics, etc. For example, solar modules from China or EVA sheets from Taiwan may face ADD to protect Indian manufacturers. You can check current ADD rates in CBIC notifications at https://cbic.gov.in or DGTR site."
    },
    {
      "question": "What is the process for claiming MEIS or RoDTEP benefits?",
      "answer": "MEIS (Merchandise Exports from India Scheme) is no longer active for shipments post Dec 31, 2020. You can still claim pending MEIS scrips on old exports via DGFT portal (https://dgft.gov.in). For RoDTEP (Remission of Duties and Taxes on Exported Products), declare RoDTEP claim in shipping bill (SB), ensure electronic credit ledger is enabled via ICEGATE, and once SB is processed, RoDTEP scrip will be transferred electronically. Use it to pay customs duty, or transfer/sell it digitally. Track RoDTEP claims via https://icegate.gov.in."
    },
    {
      "question": "How do I respond to a customs notice in India?",
      "answer": "If you receive a notice under Customs Act (e.g. SCN, demand, seizure), read carefully: Check section, demand amount, and allegations, engage a customs consultant or advocate, prepare a formal reply with documentation, submit response within 15–30 days (as specified), appear for personal hearing, if required, and file appeal to Commissioner (Appeals) or CESTAT, if unsatisfied. Timely, professional responses are crucial to avoid penalties."
    },
    {
      "question": "What is the penalty for undervaluing goods in customs documentation?",
      "answer": "Undervaluation is treated as mis-declaration, and penalties include a fine up to 100% of duty evaded (Section 114A of Customs Act), personal penalty under Section 112, goods may be confiscated, and clearance withheld, and repeated offences can trigger suspension of IEC. Use proper HS codes and invoice values. Declared value should reflect actual transaction value, per WTO customs valuation rules."
    },
    {
      "question": "Can I re-export goods that were wrongly imported?",
      "answer": "Yes, you can re-export wrongly imported goods under Section 74 of the Customs Act. Key Conditions: Goods must not be used (or used minimally), re-export must be done within 2 years of import, up to 98% of customs duty paid may be refunded, and re-export allowed only after customs approval. Use the same Bill of Entry & Shipping Bill and apply for duty drawback (re-export refund)."
    },
    {
      "question": "Which are the top 5 importing countries for Indian basmati rice?",
      "answer": "As of 2025, the leading importers of Indian basmati rice are Iran, Saudi Arabia, Iraq, United Arab Emirates (UAE), and United States (US)."
    },
    {
      "question": "What are the HS codes for automobile parts?",
      "answer": "The primary HS code for automobile parts is 8708: Parts and accessories of motor vehicles of headings 8701 to 8705. Subcategories include 87082900: Other parts and accessories of bodies (including cabs), 87083000: Brakes and servo-brakes; parts thereof, and 87089900: Other parts and accessories not specified elsewhere."
    },
    {
      "question": "Is there demand for Indian ayurvedic products in the EU?",
      "answer": "Yes, the demand for Indian Ayurvedic products in the European Union is growing. The European market for natural health products, including Ayurvedic ingredients, is expanding due to increased health consciousness and a preference for plant-based supplements. The European nutrition and supplement market is projected to reach over $61.8 billion by 2030, creating opportunities for Ayurvedic products."
    },
    {
      "question": "What are the compliance requirements for exporting software services to the US?",
      "answer": "Exporting software services from India to the US involves several compliance requirements: Import Export Code (IEC): Mandatory for all exporters, GST Registration: Required for tax purposes, Softex Forms: Necessary for reporting software exports to the Reserve Bank of India (RBI), Foreign Inward Remittance Certificate (FIRC): Proof of payment receipt in foreign currency, and Compliance with US Regulations: Ensure adherence to US export controls and data protection laws, such as the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA), especially when handling personal data."
    },
    {
      "question": "How do I get an APEDA certificate for food exports?",
      "answer": "To export scheduled food products (e.g. fruits, vegetables, processed foods), you need to register with APEDA (Agricultural and Processed Food Products Export Development Authority). Steps to get APEDA Registration: Apply online at https://apeda.gov.in, submit IEC (Import Export Code), PAN, Bank Certificate/Cancelled cheque, Business registration documents, pay the registration fee (₹5,000 + GST), and receive RCMC (Registration-Cum-Membership Certificate) digitally. RCMC is valid for 5 years and is mandatory for availing export incentives and participating in APEDA events."
    },
    {
      "question": "Is GSP certification still applicable in 2025 for exports to the UK?",
      "answer": "No, the GSP (Generalized System of Preferences) is no longer applicable for UK-bound exports post-Brexit. However, the UK has introduced its Developing Countries Trading Scheme (DCTS) which replaced GSP: India currently falls under the 'Enhanced Preferences' tier of DCTS, some products may get preferential duty, but GSP Form A is not required. Check updated tariffs and rules at https://www.gov.uk under the DCTS framework."
    },
    {
      "question": "Do I need FDA approval to export herbal supplements to the US?",
      "answer": "Yes, FDA compliance is essential for exporting herbal and dietary supplements to the United States. Key requirements: FDA Food Facility Registration (biennial), comply with 21 CFR Part 111 – Current Good Manufacturing Practices (CGMPs), labeling compliance – ingredient list, nutrition facts, warnings, no disease claims – Cannot claim to treat or cure any disease, and appoint a US Agent for communication with FDA. Products may be detained if found misbranded or adulterated under US law."
    },
    {
      "question": "What benefits do Indian exporters get under the India-EFTA agreement?",
      "answer": "The India-EFTA Trade and Economic Partnership Agreement (TEPA) was signed in March 2024 between India and four EFTA countries: Switzerland, Norway, Iceland, and Liechtenstein. Key benefits for Indian exporters: Duty-free or reduced tariff access for over 10,000 products, including textiles & garments, gems & jewellery, pharma & medical devices, machinery & industrial goods, stronger IP protection and mutual recognition of standards, liberal rules of origin make it easier to qualify for benefits, and services sector access for IT, engineering, finance, and health. Exporters can claim preferential tariffs under India-EFTA TEPA using Certificate of Origin."
    },
    {
      "question": "Has the India-UK FTA removed tariffs on Scotch whisky imports?",
      "answer": "As of 2025, the India-UK Free Trade Agreement (FTA) is finalized but not yet fully ratified. However, under the Interim Understanding: Tariffs on Scotch whisky (currently 150%) are being reduced in stages over 10 years, this is expected to make UK whiskies significantly more affordable over time. UK exporters benefit from lower Indian tariffs, and Indian exporters (e.g. apparel, rice, pharma) get improved UK market access."
    },
    {
      "question": "Does India have a free trade agreement with Australia in 2025?",
      "answer": "Yes, India and Australia signed the India-Australia Economic Cooperation and Trade Agreement (Ind-Aus ECTA), which came into effect in December 2022 and continues into 2025. Key benefits: Duty-free access for 96% of Indian exports, including garments, textiles, leather, gems, engineering goods, zero-duty access for 85% of Australia's exports to India (including coal, wool, almonds), and faster approvals for Indian pharma and professionals (visas, licensing). Exporters can claim benefits using Certificate of Origin via the DGFT e-CoO portal."
    },
    {
      "question": "How do Trump's new tariffs affect Indian exporters?",
      "answer": "As of April 2025, the U.S. imposed a flat 26% reciprocal tariff on all Indian exports, citing India's high tariffs on U.S. goods. This move significantly impacts key Indian export sectors: Electronics: $14 billion in exports, Gems & Jewellery: $9 billion, Aluminium & Auto Parts: Notably affected. However, pharmaceuticals and energy products are exempt from these tariffs. In response, India has proposed reducing its average tariff gap with the U.S. from nearly 13% to under 4%, aiming to secure a trade deal and avoid further U.S. tariff hikes."
    },
    {
      "question": "Has India imposed any new export bans recently?",
      "answer": "As of May 2025, India has not introduced new export bans. However, existing restrictions remain: Wheat: Exports have been banned since 2022 to control domestic prices, Broken Rice: The ban was lifted in March 2025, allowing exports to resume. Additionally, India has implemented port restrictions on certain exports, affecting regional trade, notably with Bangladesh."
    },
    {
      "question": "Are there new trade incentives in India's 2025 foreign trade policy?",
      "answer": "Yes, India's 2025 Foreign Trade Policy introduces several initiatives to bolster exports: Production-Linked Incentive (PLI) Schemes: Expanded to sectors like passive electronics, with an allocation of INR 229.19 billion to boost domestic manufacturing, Tax Remission Systems: Focus on schemes like RoDTEP and RoSCTL to offset indirect taxes, replacing direct cash incentives, and Export Promotion Mission 2025: Aims to enhance export competitiveness through structural reforms and incentives."
    },
    {
      "question": "What is an AEO certificate and why is it useful?",
      "answer": "An Authorized Economic Operator (AEO) certificate offers faster customs clearance, lower inspections, and trade facilitation benefits. It is ideal for trusted exporters and logistics providers."
    },
    {
      "question": "What is a Letter of Credit and how does it work?",
      "answer": "A Letter of Credit is a bank guarantee assuring the seller that payment will be received on presenting specified documents. It reduces risk in international transactions."
    },
    {
      "question": "Can I export handloom products under a special scheme?",
      "answer": "Yes, handloom products are eligible under Handloom Export Promotion Council (HEPC) schemes and RoDTEP benefits. Exporters can also participate in trade fairs and get branding support."
    },
    {
      "question": "What is the significance of a Certificate of Origin?",
      "answer": "A Certificate of Origin (COO) proves that the goods were manufactured in a specific country. It is essential for claiming preferential tariff benefits under FTAs."
    },
    {
      "question": "What is the current state of global trade growth?",
      "answer": "According to the IMF's April 2025 World Economic Outlook, global trade growth is projected to more than halve—from 3.8% last year to 1.7% this year—due to recent tariff measures and countermeasures by major economies."
    },
    {
      "question": "How is the UK balancing its trade relationships post-Brexit?",
      "answer": "Post-Brexit, the UK is pursuing a complex trade strategy, securing agreements with the US and India while aligning more closely with the EU in certain sectors. However, this balancing act risks alienating major global powers if perceived as incoherent or opportunistic."
    },
    {
      "question": "What is the Regional Comprehensive Economic Partnership (RCEP)?",
      "answer": "RCEP is a free trade agreement among Asia-Pacific nations aimed at reducing tariffs and fostering economic integration among its members."
    },
    {
      "question": "How do trade agreements like RCEP influence global trade dynamics?",
      "answer": "Such agreements can shift trade flows by creating new partnerships and reducing reliance on traditional trade routes, impacting global economic strategies."
    },
    {
      "question": "What is a Proforma Invoice?",
      "answer": "A Proforma Invoice is a preliminary bill of sale sent to buyers before a shipment, detailing the goods and terms of sale."
    },
    {
      "question": "What is a Packing List in international trade?",
      "answer": "A Packing List itemizes the contents of a shipment, including details like weight and dimensions, aiding in customs clearance and inventory management."
    },
    {
      "question": "What is a Bank Guarantee in trade finance?",
      "answer": "A Bank Guarantee is a promise from a bank that a buyer's obligations will be met, providing assurance to the seller."
    },
    {
      "question": "What is Forfaiting?",
      "answer": "Forfaiting is the purchase of receivables from exporters by a forfaiter, who assumes the risk of non-payment."
    },
    {
      "question": "What is the role of a Trade Compliance Officer?",
      "answer": "A Trade Compliance Officer ensures that a company's import and export activities adhere to all applicable laws and regulations."
    },
    {
      "question": "What are the consequences of non-compliance in international trade?",
      "answer": "Non-compliance can lead to penalties, fines, shipment delays, and reputational damage."
    },
    {
      "question": "What does DDP (Delivered Duty Paid) mean?",
      "answer": "DDP indicates that the seller bears all costs and risks associated with delivering goods to the buyer's location, including duties and taxes."
    },
    {
      "question": "What is the significance of Incoterms in trade?",
      "answer": "Incoterms define the responsibilities of buyers and sellers in international transactions, clarifying who handles shipping, insurance, and tariffs."
    },
    {
      "question": "What is the Balance of Payments (BoP)?",
      "answer": "BoP is a record of all economic transactions between residents of a country and the rest of the world over a specific period."
    },
    {
      "question": "How does a trade deficit affect a country's economy?",
      "answer": "A trade deficit can lead to increased borrowing from foreign lenders, affecting currency value and economic stability."
    },
    {
      "question": "What is international trade?",
      "answer": "International trade involves the exchange of goods and services between countries, allowing nations to specialize in production and access a broader range of products."
    },
    {
      "question": "What is comparative advantage?",
      "answer": "Comparative advantage refers to a country's ability to produce a particular good at a lower opportunity cost than others, leading to more efficient global production and trade."
    },
    {
      "question": "What are the benefits of international trade?",
      "answer": "Benefits include increased market access, economic growth, technology transfer, and consumer access to a variety of goods and services."
    },
    {
      "question": "What is a Bill of Lading (B/L)?",
      "answer": "A Bill of Lading is a legal document issued by a carrier to acknowledge receipt of cargo for shipment, serving as a shipment receipt and title of goods."
    },
    {
      "question": "What is a Certificate of Origin?",
      "answer": "This certificate verifies the country where the goods were manufactured, which can affect tariffs and trade agreements."
    },
    {
      "question": "What is a Commercial Invoice?",
      "answer": "A Commercial Invoice is a document provided by the exporter to the importer, detailing the goods sold, their value, and terms of sale."
    },
    {
      "question": "What is a Letter of Credit (LC)?",
      "answer": "An LC is a financial instrument issued by a bank guaranteeing a buyer's payment to a seller, provided certain documents are presented."
    },
    {
      "question": "What is a Bill of Exchange?",
      "answer": "A Bill of Exchange is a written, unconditional order by one party to another to pay a specified sum on demand or at a future date."
    },
    {
      "question": "What is factoring in trade finance?",
      "answer": "Factoring involves selling accounts receivable to a third party at a discount to obtain immediate cash flow."
    },
    {
      "question": "What is the Harmonized System (HS) Code?",
      "answer": "HS Codes are standardized numerical codes used internationally to classify traded products for customs purposes."
    },
    {
      "question": "What are Incoterms?",
      "answer": "Incoterms are a set of international rules defining the responsibilities of buyers and sellers in the delivery of goods."
    },
    {
      "question": "What is export control?",
      "answer": "Export control refers to laws and regulations that govern the export of sensitive technologies, goods, and services for reasons like national security."
    },
    {
      "question": "What are tariffs?",
      "answer": "Tariffs are taxes imposed on imported goods, making them more expensive to protect domestic industries."
    },
    {
      "question": "What is a Free Trade Agreement (FTA)?",
      "answer": "An FTA is a pact between countries to reduce or eliminate trade barriers, facilitating easier exchange of goods and services."
    },
    {
      "question": "What is a trade embargo?",
      "answer": "A trade embargo is a government-imposed ban on trade with a particular country or the exchange of specific goods."
    },
    {
      "question": "What is FOB (Free On Board)?",
      "answer": "FOB indicates that the seller delivers goods on board a vessel chosen by the buyer, with the buyer bearing shipping costs and risks from that point."
    },
    {
      "question": "What is CIF (Cost, Insurance, and Freight)?",
      "answer": "CIF means the seller covers the cost, insurance, and freight to bring the goods to the port of destination."
    },
    {
      "question": "What is a freight forwarder?",
      "answer": "A freight forwarder is an agent who organizes shipments for individuals or companies to get goods from the manufacturer to a market or customer."
    },
    {
      "question": "What is anti-dumping duty?",
      "answer": "It's a protectionist tariff imposed on foreign imports believed to be priced below fair market value."
    },
    {
      "question": "What is a countervailing duty?",
      "answer": "A countervailing duty is imposed to counteract subsidies provided by foreign governments to their exporters."
    },
    {
      "question": "What is a safeguard measure?",
      "answer": "Safeguard measures are temporary restrictions to protect a specific domestic industry from an unforeseen surge in imports."
    },
    {
      "question": "What is the balance of trade?",
      "answer": "The balance of trade is the difference between a country's exports and imports of goods."
    },
    {
      "question": "What is the trade-to-GDP ratio?",
      "answer": "It's a measure of a country's trade (exports + imports) relative to its gross domestic product, indicating trade openness."
    },
    {
      "question": "What is terms of trade?",
      "answer": "Terms of trade refer to the ratio between a country's export prices and its import prices."
    },
    {
      "question": "What was the percentage decline in wheat and meslin exports in FY 2023–24?",
      "answer": "-96.27%"
    },
    {
      "question": "What was the percentage decline in maize (corn) exports in FY 2023–24?",
      "answer": "-60.28%"
    },
    {
      "question": "What was the percentage decline in grain sorghum exports in FY 2023–24?",
      "answer": "-12.81%"
    },
    {
      "question": "What was the percentage decline in wheat or meslin flour exports in FY 2023–24?",
      "answer": "-67.13%"
    },
    {
      "question": "What was the percentage decline in malt whether or not roasted exports in FY 2023–24?",
      "answer": "-33.2%"
    },
    {
      "question": "What was the percentage decline in soya beans, whether or not broken exports in FY 2023–24?",
      "answer": "-86.38%"
    },
    {
      "question": "What was the percentage decline in copra exports in FY 2023–24?",
      "answer": "-20.73%"
    },
    {
      "question": "What was the percentage decline in linseed, whether or not broken exports in FY 2023–24?",
      "answer": "-11.25%"
    },
    {
      "question": "What was the percentage decline in lac;naturl gums,resns,gum-resnsandoleoresns exports in FY 2023–24?",
      "answer": "-30.9%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-26.22%"
    },
    {
      "question": "What was the percentage decline in cane/beet sugr chmcly pure sucrse in solid exports in FY 2023–24?",
      "answer": "-51.65%"
    },
    {
      "question": "What was the percentage decline in molses rsltd from the extrctn/rfng of sugr exports in FY 2023–24?",
      "answer": "-48.13%"
    },
    {
      "question": "What was the percentage decline in oil cake and othr solid residus,obtnd from grndnut exports in FY 2023–24?",
      "answer": "-13.17%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-9.48%"
    },
    {
      "question": "What was the percentage decline in unroasted iron pyrites exports in FY 2023–24?",
      "answer": "-39.44%"
    },
    {
      "question": "What was the percentage decline in natural graphite exports in FY 2023–24?",
      "answer": "-48.76%"
    },
    {
      "question": "What was the percentage decline in chalk exports in FY 2023–24?",
      "answer": "-16.12%"
    },
    {
      "question": "What was the percentage decline in asbestos exports in FY 2023–24?",
      "answer": "-62.9%"
    },
    {
      "question": "What was the percentage decline in aluminium ores and concentrates exports in FY 2023–24?",
      "answer": "-51.21%"
    },
    {
      "question": "What was the percentage decline in lead ores and concentrates exports in FY 2023–24?",
      "answer": "-62.96%"
    },
    {
      "question": "What was the percentage decline in zinc ores and concentrates exports in FY 2023–24?",
      "answer": "-66.03%"
    },
    {
      "question": "What was the percentage decline in chromium ores and concentrates exports in FY 2023–24?",
      "answer": "-89.03%"
    },
    {
      "question": "What was the percentage decline in molybdenum ores and concentrates exports in FY 2023–24?",
      "answer": "-16.66%"
    },
    {
      "question": "What was the percentage decline in precious metal ores and concentrates exports in FY 2023–24?",
      "answer": "-97.5%"
    },
    {
      "question": "What was the percentage decline in grnulatd slag(slag sand) from iron/steel exports in FY 2023–24?",
      "answer": "-57.17%"
    },
    {
      "question": "What was the percentage decline in peat(incldng peat litter) w/n aglomrtd exports in FY 2023–24?",
      "answer": "-52.17%"
    },
    {
      "question": "What was the percentage decline in petrlm gases and othr gaseous hydrcrbns exports in FY 2023–24?",
      "answer": "-21.95%"
    },
    {
      "question": "What was the percentage decline in fluorine, chlorine, bromine and iodine exports in FY 2023–24?",
      "answer": "-61.58%"
    },
    {
      "question": "What was the percentage decline in hydrogen, rare gases and other non-metals exports in FY 2023–24?",
      "answer": "-23.85%"
    },
    {
      "question": "What was the percentage decline in sulphuric acid; oleum exports in FY 2023–24?",
      "answer": "-50.93%"
    },
    {
      "question": "What was the percentage decline in nitric acid; sulphonitric acids exports in FY 2023–24?",
      "answer": "-6.57%"
    },
    {
      "question": "What was the percentage decline in oxides of boron; boric acids exports in FY 2023–24?",
      "answer": "-52.76%"
    },
    {
      "question": "What was the percentage decline in halides and halide oxides of non-metals exports in FY 2023–24?",
      "answer": "-27.51%"
    },
    {
      "question": "What was the percentage decline in ammonia, anhydrous or in aqueous solution exports in FY 2023–24?",
      "answer": "-16.18%"
    },
    {
      "question": "What was the percentage decline in zinc oxide; zinc peroxide exports in FY 2023–24?",
      "answer": "-9.35%"
    },
    {
      "question": "What was the percentage decline in titanium oxides exports in FY 2023–24?",
      "answer": "-38.17%"
    },
    {
      "question": "What was the percentage decline in dithonites and sulphoxylates exports in FY 2023–24?",
      "answer": "-19.76%"
    },
    {
      "question": "What was the percentage decline in sulphates; alums; peroxosulphates ( persulphates) exports in FY 2023–24?",
      "answer": "-9.13%"
    },
    {
      "question": "What was the percentage decline in nitrites; nitrates exports in FY 2023–24?",
      "answer": "-12.73%"
    },
    {
      "question": "What was the percentage decline in borates; peroxoborates (perborates) exports in FY 2023–24?",
      "answer": "-25.84%"
    },
    {
      "question": "What was the percentage decline in carbides, whether or not chemically defined exports in FY 2023–24?",
      "answer": "-27.62%"
    },
    {
      "question": "What was the percentage decline in cyclic hydrocarbons exports in FY 2023–24?",
      "answer": "-38.1%"
    },
    {
      "question": "What was the percentage decline in halogenated derivatives of hydrocarbons exports in FY 2023–24?",
      "answer": "-31.01%"
    },
    {
      "question": "What was the percentage decline in phenols; phenol-alcohols exports in FY 2023–24?",
      "answer": "-20.31%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-26.34%"
    },
    {
      "question": "What was the percentage decline in oxygen-function amino-compounds exports in FY 2023–24?",
      "answer": "-8.71%"
    },
    {
      "question": "What was the percentage decline in nitrile-function compounds exports in FY 2023–24?",
      "answer": "-25.55%"
    },
    {
      "question": "What was the percentage decline in diazo-, azo- or azoxy-compounds exports in FY 2023–24?",
      "answer": "-14.38%"
    },
    {
      "question": "What was the percentage decline in orgnc drvtvs of hydrazine/of hydroxylamine exports in FY 2023–24?",
      "answer": "-16.25%"
    },
    {
      "question": "What was the percentage decline in compounds with other nitrogen function exports in FY 2023–24?",
      "answer": "-11.26%"
    },
    {
      "question": "What was the percentage decline in other organo-inorganic compounds exports in FY 2023–24?",
      "answer": "-22.02%"
    },
    {
      "question": "What was the percentage decline in 2938 o exports in FY 2023–24?",
      "answer": "-5.01%"
    },
    {
      "question": "What was the percentage decline in other organic compounds exports in FY 2023–24?",
      "answer": "-6.06%"
    },
    {
      "question": "What was the percentage decline in mineral or chemical fertilisers, nitrogenous exports in FY 2023–24?",
      "answer": "-49.88%"
    },
    {
      "question": "What was the percentage decline in syntc orgnc colrng matr w/n chmcly dfnd exports in FY 2023–24?",
      "answer": "-11.09%"
    },
    {
      "question": "What was the percentage decline in albumins albumints and othr albumin drvtvs exports in FY 2023–24?",
      "answer": "-36.65%"
    },
    {
      "question": "What was the percentage decline in polyacetals, other polyethers and epoxide resins, exports in FY 2023–24?",
      "answer": "-32.9%"
    },
    {
      "question": "What was the percentage decline in polyamides in primary forms exports in FY 2023–24?",
      "answer": "-6.38%"
    },
    {
      "question": "What was the percentage decline in amino-resins, phenolic resins and polyurethanes, exports in FY 2023–24?",
      "answer": "-5.88%"
    },
    {
      "question": "What was the percentage decline in silicones in primary forms exports in FY 2023–24?",
      "answer": "-25.26%"
    },
    {
      "question": "What was the percentage decline in to 3913, in primary forms exports in FY 2023–24?",
      "answer": "-5.26%"
    },
    {
      "question": "What was the percentage decline in waste, parings and scrap, of plastics exports in FY 2023–24?",
      "answer": "-50.07%"
    },
    {
      "question": "What was the percentage decline in other plates, sheets, film, foil and strip, of plastics exports in FY 2023–24?",
      "answer": "-5.93%"
    },
    {
      "question": "What was the percentage decline in vulcanised rubber thread and cord exports in FY 2023–24?",
      "answer": "-12.31%"
    },
    {
      "question": "What was the percentage decline in other articles of leather or of composition leather exports in FY 2023–24?",
      "answer": "-14.48%"
    },
    {
      "question": "What was the percentage decline in artificial fur and articles thereof exports in FY 2023–24?",
      "answer": "-39.96%"
    },
    {
      "question": "What was the percentage decline in wod chrcl(incl shl/nut chrcl) w/n aglomrtd exports in FY 2023–24?",
      "answer": "-24.96%"
    },
    {
      "question": "What was the percentage decline in wood wool; wood flour exports in FY 2023–24?",
      "answer": "-30.19%"
    },
    {
      "question": "What was the percentage decline in rly and trmy sleepers(crossties) of wood exports in FY 2023–24?",
      "answer": "-98.73%"
    },
    {
      "question": "What was the percentage decline in tableware and kitchenware, of wood exports in FY 2023–24?",
      "answer": "-8.51%"
    },
    {
      "question": "What was the percentage decline in newsprint, in rolls or sheets exports in FY 2023–24?",
      "answer": "-49.71%"
    },
    {
      "question": "What was the percentage decline in ; hnd-mde papr exports in FY 2023–24?",
      "answer": "-28.35%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-12.27%"
    },
    {
      "question": "What was the percentage decline in filter blocks, slabs and plates, of paper pulp exports in FY 2023–24?",
      "answer": "-16.24%"
    },
    {
      "question": "What was the percentage decline in transfers (decalcomanias) exports in FY 2023–24?",
      "answer": "-11.74%"
    },
    {
      "question": "What was the percentage decline in yrn spn frm slk wst nt put up fr retal sle exports in FY 2023–24?",
      "answer": "-9.48%"
    },
    {
      "question": "What was the percentage decline in fine/coarse anml hair nt crded/combed exports in FY 2023–24?",
      "answer": "-70.87%"
    },
    {
      "question": "What was the percentage decline in grntd stock of wool/fine/coarse anml hair exports in FY 2023–24?",
      "answer": "-55.51%"
    },
    {
      "question": "What was the percentage decline in wovn fbrcs of cmbd wool/fine anml hair exports in FY 2023–24?",
      "answer": "-21.96%"
    },
    {
      "question": "What was the percentage decline in coton sewng thred w/n put up for retl sale exports in FY 2023–24?",
      "answer": "-10.01%"
    },
    {
      "question": "What was the percentage decline in other woven fabrics of cotton exports in FY 2023–24?",
      "answer": "-22.5%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-15.33%"
    },
    {
      "question": "What was the percentage decline in yarn of other vegetable textile fibres; paper yarn exports in FY 2023–24?",
      "answer": "-20.37%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-18.46%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-8.88%"
    },
    {
      "question": "What was the percentage decline in woven fabrics of artificial filament yarn, exports in FY 2023–24?",
      "answer": "-20.31%"
    },
    {
      "question": "What was the percentage decline in synthetic filament tow exports in FY 2023–24?",
      "answer": "-38.21%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-31.25%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-20.39%"
    },
    {
      "question": "What was the percentage decline in other knitted or crocheted fabrics exports in FY 2023–24?",
      "answer": "-15.55%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-32.87%"
    },
    {
      "question": "What was the percentage decline in mens/boys shirts,knitted/crocheted exports in FY 2023–24?",
      "answer": "-9.32%"
    },
    {
      "question": "What was the percentage decline in t-shrts,snglts and othr vests,knttd/crchtd exports in FY 2023–24?",
      "answer": "-11.9%"
    },
    {
      "question": "What was the percentage decline in other garments, knitted or crocheted exports in FY 2023–24?",
      "answer": "-14.69%"
    },
    {
      "question": "What was the percentage decline in gloves, mittens and mitts, knitted or crocheted exports in FY 2023–24?",
      "answer": "-11.27%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-49.31%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-18.26%"
    },
    {
      "question": "What was the percentage decline in womens or girls blouses, shirts and shirt-blouses exports in FY 2023–24?",
      "answer": "-5.44%"
    },
    {
      "question": "What was the percentage decline in babies garments and clothing accessories exports in FY 2023–24?",
      "answer": "-15.2%"
    },
    {
      "question": "What was the percentage decline in or 5907 exports in FY 2023–24?",
      "answer": "-8.88%"
    },
    {
      "question": "What was the percentage decline in trck suits,ski suits and swmwear,othr grmnts exports in FY 2023–24?",
      "answer": "-11.42%"
    },
    {
      "question": "What was the percentage decline in ties, bow ties and cravats exports in FY 2023–24?",
      "answer": "-93.55%"
    },
    {
      "question": "What was the percentage decline in gloves, mittens and mitts exports in FY 2023–24?",
      "answer": "-22.37%"
    },
    {
      "question": "What was the percentage decline in worn clothing and other worn articles exports in FY 2023–24?",
      "answer": "-13.05%"
    },
    {
      "question": "What was the percentage decline in to 6602 exports in FY 2023–24?",
      "answer": "-42.62%"
    },
    {
      "question": "What was the percentage decline in wrkd slate and artcls of slate/aglmrtd slate exports in FY 2023–24?",
      "answer": "-7.64%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-5.04%"
    },
    {
      "question": "What was the percentage decline in cermc pipes conduits guttrng and pipe fittng exports in FY 2023–24?",
      "answer": "-89.69%"
    },
    {
      "question": "What was the percentage decline in safty glss constng of toughnd/lmntd glss exports in FY 2023–24?",
      "answer": "-7.93%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-25.23%"
    },
    {
      "question": "What was the percentage decline in imitation jewellery exports in FY 2023–24?",
      "answer": "-6.23%"
    },
    {
      "question": "What was the percentage decline in ferro-alloys exports in FY 2023–24?",
      "answer": "-15.15%"
    },
    {
      "question": "What was the percentage decline in ferrous waste and scrap; remelting scrap ingots exports in FY 2023–24?",
      "answer": "-30.16%"
    },
    {
      "question": "What was the percentage decline in grnl and pwdr,of pig iron,spglsn,iron/steel exports in FY 2023–24?",
      "answer": "-76.04%"
    },
    {
      "question": "What was the percentage decline in semi-finished products of iron or non- alloy steel exports in FY 2023–24?",
      "answer": "-49.92%"
    },
    {
      "question": "What was the percentage decline in other bars and rods of iron or non-alloy steel exports in FY 2023–24?",
      "answer": "-7.66%"
    },
    {
      "question": "What was the percentage decline in angls,shapes and sctns of iron/non-alloy stl exports in FY 2023–24?",
      "answer": "-43.86%"
    },
    {
      "question": "What was the percentage decline in wire of iron or non-alloy steel exports in FY 2023–24?",
      "answer": "-8.05%"
    },
    {
      "question": "What was the percentage decline in wire of stainless steel exports in FY 2023–24?",
      "answer": "-17.05%"
    },
    {
      "question": "What was the percentage decline in wire of other alloy steel exports in FY 2023–24?",
      "answer": "-15.13%"
    },
    {
      "question": "What was the percentage decline in tubes, pipes and hollow profiles, of cast iron exports in FY 2023–24?",
      "answer": "-12.33%"
    },
    {
      "question": "What was the percentage decline in chain and parts thereof, of iron or steel exports in FY 2023–24?",
      "answer": "-5.99%"
    },
    {
      "question": "What was the percentage decline in sanitary ware and parts thereof, of iron or steel exports in FY 2023–24?",
      "answer": "-15.48%"
    },
    {
      "question": "What was the percentage decline in other cast articles of iron or steel exports in FY 2023–24?",
      "answer": "-7.7%"
    },
    {
      "question": "What was the percentage decline in coper mattes;cement coper(precipitd coper) exports in FY 2023–24?",
      "answer": "-7.22%"
    },
    {
      "question": "What was the percentage decline in master alloys of copper exports in FY 2023–24?",
      "answer": "-28.51%"
    },
    {
      "question": "What was the percentage decline in copper bars, rods and profiles exports in FY 2023–24?",
      "answer": "-10.48%"
    },
    {
      "question": "What was the percentage decline in unwrought nickel exports in FY 2023–24?",
      "answer": "-85.28%"
    },
    {
      "question": "What was the percentage decline in nickel plates, sheets, strip and foil exports in FY 2023–24?",
      "answer": "-9.38%"
    },
    {
      "question": "What was the percentage decline in unwrought aluminium exports in FY 2023–24?",
      "answer": "-20.55%"
    },
    {
      "question": "What was the percentage decline in aluminium bars, rods and profiles exports in FY 2023–24?",
      "answer": "-30.57%"
    },
    {
      "question": "What was the percentage decline in aluminium tubes and pipes exports in FY 2023–24?",
      "answer": "-18.37%"
    },
    {
      "question": "What was the percentage decline in lead waste and scrap exports in FY 2023–24?",
      "answer": "-93.5%"
    },
    {
      "question": "What was the percentage decline in lead plates, sheets, strip and foil; lead powders and exports in FY 2023–24?",
      "answer": "-16.25%"
    },
    {
      "question": "What was the percentage decline in other articles of lead exports in FY 2023–24?",
      "answer": "-51.26%"
    },
    {
      "question": "What was the percentage decline in unwrought zinc exports in FY 2023–24?",
      "answer": "-47.96%"
    },
    {
      "question": "What was the percentage decline in zinc plates, sheets, strip and foil exports in FY 2023–24?",
      "answer": "-33.92%"
    },
    {
      "question": "What was the percentage decline in other articles of zinc exports in FY 2023–24?",
      "answer": "-13.17%"
    },
    {
      "question": "What was the percentage decline in other articles of tin exports in FY 2023–24?",
      "answer": "-35.12%"
    },
    {
      "question": "What was the percentage decline in cntrl htng boilrs excl of hdg no.8402 exports in FY 2023–24?",
      "answer": "-23.24%"
    },
    {
      "question": "What was the percentage decline in other engines and motors exports in FY 2023–24?",
      "answer": "-22.13%"
    },
    {
      "question": "What was the percentage decline in milking machines and dairy machinery exports in FY 2023–24?",
      "answer": "-13.46%"
    },
    {
      "question": "What was the percentage decline in weaving machines (looms) exports in FY 2023–24?",
      "answer": "-27.92%"
    },
    {
      "question": "What was the percentage decline in to 8472 exports in FY 2023–24?",
      "answer": "-19.73%"
    },
    {
      "question": "What was the percentage decline in ball or roller bearings exports in FY 2023–24?",
      "answer": "-6.49%"
    },
    {
      "question": "What was the percentage decline in electric generating sets and rotary converters exports in FY 2023–24?",
      "answer": "-9.78%"
    },
    {
      "question": "What was the percentage decline in elctrnc integrtd circuits and micro-assmbls exports in FY 2023–24?",
      "answer": "-43.18%"
    },
    {
      "question": "What was the percentage decline in other rail locomotives; locomotive tenders exports in FY 2023–24?",
      "answer": "-51.28%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-60.7%"
    },
    {
      "question": "What was the percentage decline in ralwy/trmwy goods van and wagn,nt self-prpld exports in FY 2023–24?",
      "answer": "-54.6%"
    },
    {
      "question": "What was the percentage decline in tractors (other than tractors of heading 8709) exports in FY 2023–24?",
      "answer": "-25.52%"
    },
    {
      "question": "What was the percentage decline in motor vehicles for the transport of goods exports in FY 2023–24?",
      "answer": "-24.22%"
    },
    {
      "question": "What was the percentage decline in to 8705 exports in FY 2023–24?",
      "answer": "-15.87%"
    },
    {
      "question": "What was the percentage decline in baby carriages and parts thereof exports in FY 2023–24?",
      "answer": "-51.79%"
    },
    {
      "question": "What was the percentage decline in unmanned aircraft exports in FY 2023–24?",
      "answer": "-38.26%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-55.21%"
    },
    {
      "question": "What was the percentage decline in watch movements, complete and assembled exports in FY 2023–24?",
      "answer": "-14.02%"
    },
    {
      "question": "What was the percentage decline in watch cases and parts thereof exports in FY 2023–24?",
      "answer": "-50.3%"
    },
    {
      "question": "What was the percentage decline in exports in FY 2023–24?",
      "answer": "-63.67%"
    },
    {
      "question": "What was the percentage decline in prtsand accssrs of artcl of hdg 9301-9304 exports in FY 2023–24?",
      "answer": "-13.21%"
    },
    {
      "question": "What was the percentage decline in prefabricated buildings exports in FY 2023–24?",
      "answer": "-11.73%"
    },
    {
      "question": "What was the percentage decline in butn,prs-fstnr,snp-fstnr and prss-stud etc exports in FY 2023–24?",
      "answer": "-6.59%"
    },
    {
      "question": "What was the percentage decline in slide fasteners and parts thereof exports in FY 2023–24?",
      "answer": "-17.49%"
    },
    {
      "question": "What was the percentage decline in monopods, bipods, tripods and similar articles exports in FY 2023–24?",
      "answer": "-5.67%"
    },
    {
      "question": "What was the percentage decline in antiques of an age exceeding one hundred years exports in FY 2023–24?",
      "answer": "-99.99%"
    },
    {
      "question": "What was the percentage decline in dutiable import by post or air for persona exports in FY 2023–24?",
      "answer": "-10.29%"
    },
    {
      "question": "What was the percentage decline in unspecified items exports in FY 2023–24?",
      "answer": "-9.9%"
    },
    {
      "question": "What's the weather like today?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "Tell me a joke",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "What's your favorite movie?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "How do I cook pasta?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "What's the capital of France?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "Can you help me with my math homework?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "What's the best way to learn a new language?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "How do I fix my computer?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "What's the meaning of life?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "Can you write a poem for me?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "What's the best restaurant in town?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "How do I lose weight?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "What's the latest news?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "Can you help me plan my vacation?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "What's the best way to invest in stocks?",
      "answer": "I'm a trade-specific assistant and cannot process queries outside trade, export, import, logistics, or compliance-related topics."
    },
    {
      "question": "What was the export value of Engineering Goods in Apr-May 2023?",
     "answer": "The export value of Engineering Goods in Apr-May 2023 was $18,277.05 million."
     },
{"question": "What was the month-on-month change in exports for Engineering Goods in May 2023?", "answer": "The month-on-month change in exports for Engineering Goods in May 2023 was 3.62%."},
{"question": "What is the export share of Engineering Goods in Apr-May 2023?", "answer": "The export share of Engineering Goods in Apr-May 2023 was 26.41%."},
{"question": "What was the export value of Petroleum Products in Apr-May 2023?", "answer": "The export value of Petroleum Products in Apr-May 2023 was $11,960.38 million."},
{"question": "What was the month-on-month change in exports for Petroleum Products in May 2023?", "answer": "The month-on-month change in exports for Petroleum Products in May 2023 was -7.94%."},
{"question": "What is the export share of Petroleum Products in Apr-May 2023?", "answer": "The export share of Petroleum Products in Apr-May 2023 was 17.28%."},
{"question": "What was the export value of Gems And Jewellery in Apr-May 2023?", "answer": "The export value of Gems And Jewellery in Apr-May 2023 was $5,248.24 million."},
{"question": "What was the month-on-month change in exports for Gems And Jewellery in May 2023?", "answer": "The month-on-month change in exports for Gems And Jewellery in May 2023 was 16.40%."},
{"question": "What is the export share of Gems And Jewellery in Apr-May 2023?", "answer": "The export share of Gems And Jewellery in Apr-May 2023 was 7.58%."},
{"question": "What was the export value of Electronic Goods in Apr-May 2023?", "answer": "The export value of Electronic Goods in Apr-May 2023 was $4,536.02 million."},
{"question": "What was the month-on-month change in exports for Electronic Goods in May 2023?", "answer": "The month-on-month change in exports for Electronic Goods in May 2023 was 14.61%."},
{"question": "What is the export share of Electronic Goods in Apr-May 2023?", "answer": "The export share of Electronic Goods in Apr-May 2023 was 6.55%."},
{"question": "What was the export value of Organic and Inorganic Chemicals in Apr-May 2023?", "answer": "The export value of Organic and Inorganic Chemicals in Apr-May 2023 was $4,381.02 million."},
{"question": "What was the month-on-month change in exports for Organic and Inorganic Chemicals in May 2023?", "answer": "The month-on-month change in exports for Organic and Inorganic Chemicals in May 2023 was 4.19%."},
{"question": "What is the export share of Organic and Inorganic Chemicals in Apr-May 2023?", "answer": "The export share of Organic and Inorganic Chemicals in Apr-May 2023 was 6.33%."},
{"question": "What was the export value of Drugs And Pharmaceuticals in Apr-May 2023?", "answer": "The export value of Drugs And Pharmaceuticals in Apr-May 2023 was $4,342.77 million."},
{"question": "What was the month-on-month change in exports for Drugs And Pharmaceuticals in May 2023?", "answer": "The month-on-month change in exports for Drugs And Pharmaceuticals in May 2023 was -9.52%."},
{"question": "What is the export share of Drugs And Pharmaceuticals in Apr-May 2023?", "answer": "The export share of Drugs And Pharmaceuticals in Apr-May 2023 was 6.28%."},
{"question": "What was the export value of Others in Apr-May 2023?", "answer": "The export value of Others in Apr-May 2023 was $3,784.17 million."},
{"question": "What was the month-on-month change in exports for Others in May 2023?", "answer": "The month-on-month change in exports for Others in May 2023 was 0.38%."},
{"question": "What is the export share of Others in Apr-May 2023?", "answer": "The export share of Others in Apr-May 2023 was 5.47%."},
{"question": "What was the export value of Ready-made garments of all textiles in Apr-May 2023?", "answer": "The export value of Ready-made garments of all textiles in Apr-May 2023 was $2,444.84 million."},
{"question": "What was the month-on-month change in exports for Ready-made garments of all textiles in May 2023?", "answer": "The month-on-month change in exports for Ready-made garments of all textiles in May 2023 was 2.07%."},
{"question": "What is the export share of Ready-made garments of all textiles in Apr-May 2023?", "answer": "The export share of Ready-made garments of all textiles in Apr-May 2023 was 3.53%."},
{"question": "What was the export value of Rice in Apr-May 2023?", "answer": "The export value of Rice in Apr-May 2023 was $1,976.89 million."},
{"question": "What was the month-on-month change in exports for Rice in May 2023?", "answer": "The month-on-month change in exports for Rice in May 2023 was -2.24%."},
{"question": "What is the export share of Rice in Apr-May 2023?", "answer": "The export share of Rice in Apr-May 2023 was 2.86%."},
{"question": "What was the export value of Cotton Yarn/Fabs./Madeups, Handloom Products Etc. in Apr-May 2023?", "answer": "The export value of Cotton Yarn/Fabs./Madeups, Handloom Products Etc. in Apr-May 2023 was $1,807.68 million."},
{"question": "What was the month-on-month change in exports for Cotton Yarn/Fabs./Madeups, Handloom Products Etc. in May 2023?", "answer": "The month-on-month change in exports for Cotton Yarn/Fabs./Madeups, Handloom Products Etc. in May 2023 was 3.61%."},
{"question": "What is the export share of Cotton Yarn/Fabs./Madeups, Handloom Products Etc. in Apr-May 2023?", "answer": "The export share of Cotton Yarn/Fabs./Madeups, Handloom Products Etc. in Apr-May 2023 was 2.61%."},
{"question": "What was the export value of Plastic And Linoleum in Apr-May 2023?", "answer": "The export value of Plastic And Linoleum in Apr-May 2023 was $1,295.58 million."},
{"question": "What was the month-on-month change in exports for Plastic And Linoleum in May 2023?", "answer": "The month-on-month change in exports for Plastic And Linoleum in May 2023 was 0.84%."},
{"question": "What is the export share of Plastic And Linoleum in Apr-May 2023?", "answer": "The export share of Plastic And Linoleum in Apr-May 2023 was 1.87%."},
{"question": "What was the export value of Marine Products in Apr-May 2023?", "answer": "The export value of Marine Products in Apr-May 2023 was $1,164.97 million."},
{"question": "What was the month-on-month change in exports for Marine Products in May 2023?", "answer": "The month-on-month change in exports for Marine Products in May 2023 was 5.56%."},
{"question": "What was the export value of Spices in Apr-May 2023?", "answer": "The export value of Spices in Apr-May 2023 was $815.38 million."},
{"question": "What was the month-on-month change in exports for Spices in May 2023?", "answer": "The month-on-month change in exports for Spices in May 2023 was 25.60%."},
{"question": "What is the export share of Spices in Apr-May 2023?", "answer": "The export share of Spices in Apr-May 2023 was 1.18%."},
{"question": "What was the export value of Man-Made Yarn/Fabs./Madeups Etc. in Apr-May 2023?", "answer": "The export value of Man-Made Yarn/Fabs./Madeups Etc. in Apr-May 2023 was $786.66 million."},
{"question": "What was the month-on-month change in exports for Man-Made Yarn/Fabs./Madeups Etc. in May 2023?", "answer": "The month-on-month change in exports for Man-Made Yarn/Fabs./Madeups Etc. in May 2023 was 0.28%."},
{"question": "What is the export share of Man-Made Yarn/Fabs./Madeups Etc. in Apr-May 2023?", "answer": "The export share of Man-Made Yarn/Fabs./Madeups Etc. in Apr-May 2023 was 1.14%."},
{"question": "What was the export value of Mica, Coal And Other Ores, Minerals Including Process in Apr-May 2023?", "answer": "The export value of Mica, Coal And Other Ores, Minerals Including Process in Apr-May 2023 was $773.52 million."},
{"question": "What was the month-on-month change in exports for Mica, Coal And Other Ores, Minerals Including Process in May 2023?", "answer": "The month-on-month change in exports for Mica, Coal And Other Ores, Minerals Including Process in May 2023 was 0.23%."},
{"question": "What is the export share of Mica, Coal And Other Ores, Minerals Including Process in Apr-May 2023?", "answer": "The export share of Mica, Coal And Other Ores, Minerals Including Process in Apr-May 2023 was 1.12%."},
{"question": "What was the export value of Ceramic Products And Glassware in Apr-May 2023?", "answer": "The export value of Ceramic Products And Glassware in Apr-May 2023 was $734.77 million."},
{"question": "What was the month-on-month change in exports for Ceramic Products And Glassware in May 2023?", "answer": "The month-on-month change in exports for Ceramic Products And Glassware in May 2023 was 2.47%."},
{"question": "What is the export share of Ceramic Products And Glassware in Apr-May 2023?", "answer": "The export share of Ceramic Products And Glassware in Apr-May 2023 was 1.06%."},
{"question": "What was the export value of Leather And Leather Manufactures in Apr-May 2023?", "answer": "The export value of Leather And Leather Manufactures in Apr-May 2023 was $695.66 million."},
{"question": "What was the month-on-month change in exports for Leather And Leather Manufactures in May 2023?", "answer": "The month-on-month change in exports for Leather And Leather Manufactures in May 2023 was 12.84%."},
{"question": "What is the export share of Leather And Leather Manufactures in Apr-May 2023?", "answer": "The export share of Leather And Leather Manufactures in Apr-May 2023 was 1.01%."},
{"question": "What was the export value of Meat, Dairy And Poultry Products in Apr-May 2023?", "answer": "The export value of Meat, Dairy And Poultry Products in Apr-May 2023 was $647.92 million."},
{"question": "What was the month-on-month change in exports for Meat, Dairy And Poultry Products in May 2023?", "answer": "The month-on-month change in exports for Meat, Dairy And Poultry Products in May 2023 was -9.52%."},
{"question": "What is the export share of Meat, Dairy And Poultry Products in Apr-May 2023?", "answer": "The export share of Meat, Dairy And Poultry Products in Apr-May 2023 was 0.94%."},
{"question": "What was the export value of Iron Ore in Apr-May 2023?", "answer": "The export value of Iron Ore in Apr-May 2023 was $642.99 million."},
{"question": "What was the month-on-month change in exports for Iron Ore in May 2023?", "answer": "The month-on-month change in exports for Iron Ore in May 2023 was -18.61%."},
{"question": "What is the export share of Iron Ore in Apr-May 2023?", "answer": "The export share of Iron Ore in Apr-May 2023 was 0.93%."},
{"question": "What was the export value of Fruits And Vegetables in Apr-May 2023?", "answer": "The export value of Fruits And Vegetables in Apr-May 2023 was $557.11 million."},
{"question": "What was the month-on-month change in exports for Fruits And Vegetables in May 2023?", "answer": "The month-on-month change in exports for Fruits And Vegetables in May 2023 was -21.48%."},
{"question": "What is the export share of Fruits And Vegetables in Apr-May 2023?", "answer": "The export share of Fruits And Vegetables in Apr-May 2023 was 0.81%."},
{"question": "What was the export value of Cereal Preparations And Miscellaneous Processed Item in Apr-May 2023?", "answer": "The export value of Cereal Preparations And Miscellaneous Processed Item in Apr-May 2023 was $462.10 million."},
{"question": "What was the month-on-month change in exports for Cereal Preparations And Miscellaneous Processed Item in May 2023?", "answer": "The month-on-month change in exports for Cereal Preparations And Miscellaneous Processed Item in May 2023 was -1.87%."},
{"question": "What is the export share of Cereal Preparations And Miscellaneous Processed Item in Apr-May 2023?", "answer": "The export share of Cereal Preparations And Miscellaneous Processed Item in Apr-May 2023 was 0.67%."},
{"question": "What was the export value of Oil Meals in Apr-May 2023?", "answer": "The export value of Oil Meals in Apr-May 2023 was $349.24 million."},
{"question": "What was the month-on-month change in exports for Oil Meals in May 2023?", "answer": "The month-on-month change in exports for Oil Meals in May 2023 was -24.06%."},
{"question": "What is the export share of Oil Meals in Apr-May 2023?", "answer": "The export share of Oil Meals in Apr-May 2023 was 0.50%."},
{"question": "What was the export value of Handicrafts Excl. Hand Made Carpet in Apr-May 2023?", "answer": "The export value of Handicrafts Excl. Hand Made Carpet in Apr-May 2023 was $245.46 million."},
{"question": "What was the month-on-month change in exports for Handicrafts Excl. Hand Made Carpet in May 2023?", "answer": "The month-on-month change in exports for Handicrafts Excl. Hand Made Carpet in May 2023 was 3.53%."},
{"question": "What is the export share of Handicrafts Excl. Hand Made Carpet in Apr-May 2023?", "answer": "The export share of Handicrafts Excl. Hand Made Carpet in Apr-May 2023 was 0.35%."},
{"question": "What was the export value of Oil Seeds in Apr-May 2023?", "answer": "The export value of Oil Seeds in Apr-May 2023 was $239.81 million."},
{"question": "What was the month-on-month change in exports for Oil Seeds in May 2023?", "answer": "The month-on-month change in exports for Oil Seeds in May 2023 was -23.75%."},
{"question": "What is the export share of Oil Seeds in Apr-May 2023?", "answer": "The export share of Oil Seeds in Apr-May 2023 was 0.35%."},
{"question": "What was the export value of Coffee in Apr-May 2023?", "answer": "The export value of Coffee in Apr-May 2023 was $231.30 million."},
{"question": "What was the month-on-month change in exports for Coffee in May 2023?", "answer": "The month-on-month change in exports for Coffee in May 2023 was -4.56%."},
{"question": "What is the export share of Coffee in Apr-May 2023?", "answer": "The export share of Coffee in Apr-May 2023 was 0.33%."},
{"question": "What was the export value of Carpet in Apr-May 2023?", "answer": "The export value of Carpet in Apr-May 2023 was $216.37 million."},
{"question": "What was the month-on-month change in exports for Carpet in May 2023?", "answer": "The month-on-month change in exports for Carpet in May 2023 was 5.75%."},
{"question": "What is the export share of Carpet in Apr-May 2023?", "answer": "The export share of Carpet in Apr-May 2023 was 0.31%."},
{"question": "What was the export value of Tobacco in Apr-May 2023?", "answer": "The export value of Tobacco in Apr-May 2023 was $196.06 million."},
{"question": "What was the month-on-month change in exports for Tobacco in May 2023?", "answer": "The month-on-month change in exports for Tobacco in May 2023 was -12.35%."},
{"question": "What is the export share of Tobacco in Apr-May 2023?", "answer": "The export share of Tobacco in Apr-May 2023 was 0.28%."},
{"question": "What was the export value of Other Cereals in Apr-May 2023?", "answer": "The export value of Other Cereals in Apr-May 2023 was $168.20 million."},
{"question": "What was the month-on-month change in exports for Other Cereals in May 2023?", "answer": "The month-on-month change in exports for Other Cereals in May 2023 was 64.67%."},
{"question": "What is the export share of Other Cereals in Apr-May 2023?", "answer": "The export share of Other Cereals in Apr-May 2023 was 0.24%."},
{"question": "What was the export value of Tea in Apr-May 2023?", "answer": "The export value of Tea in Apr-May 2023 was $101.73 million."},
{"question": "What was the month-on-month change in exports for Tea in May 2023?", "answer": "The month-on-month change in exports for Tea in May 2023 was 13.85%."},
{"question": "What is the export share of Tea in Apr-May 2023?", "answer": "The export share of Tea in Apr-May 2023 was 0.15%."},
{"question": "What was the export value of Jute Mfg. Including Floor Covering in Apr-May 2023?", "answer": "The export value of Jute Mfg. Including Floor Covering in Apr-May 2023 was $63.70 million."},
{"question": "What was the month-on-month change in exports for Jute Mfg. Including Floor Covering in May 2023?", "answer": "The month-on-month change in exports for Jute Mfg. Including Floor Covering in May 2023 was -9.00%."},
{"question": "What is the export share of Jute Mfg. Including Floor Covering in Apr-May 2023?", "answer": "The export share of Jute Mfg. Including Floor Covering in Apr-May 2023 was 0.09%."},
{"question": "What was the export value of Cashew in Apr-May 2023?", "answer": "The export value of Cashew in Apr-May 2023 was $55.25 million."},
{"question": "What was the month-on-month change in exports for Cashew in May 2023?", "answer": "The month-on-month change in exports for Cashew in May 2023 was 4.03%."},
{"question": "What is the export share of Cashew in Apr-May 2023?", "answer": "The export share of Cashew in Apr-May 2023 was 0.08%."},
{"question": "What was the export value of Total in Apr-May 2023?", "answer": "The export value of Total in Apr-May 2023 was $69,202.84 million."},
{"question": "What was the month-on-month change in exports for Total in May 2023?", "answer": "The month-on-month change in exports for Total in May 2023 was 1.23%."},
{"question": "What is the export share of Total in Apr-May 2023?", "answer": "The export share of Total in Apr-May 2023 was 100.00%."},
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Mongo connected');

  for (const item of examples) {
    if (!item.question || typeof item.question !== 'string') {
      console.error('Invalid question:', item);
      continue;
    }

    const embedding = await getEmbedding(item.question);
    await Example.create({
      question: item.question,
      answer: item.answer,
      embedding
    });
    console.log(`Inserted: ${item.question}`);
  }

  console.log('All examples inserted!');
  process.exit(0);
});
