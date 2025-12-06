/**
 * Islamic Finance Knowledge Base
 *
 * Contains all Islamic chapters and their content
 * for seeding into the RAG system.
 *
 * Chapters are from the IS Dataset focusing on:
 * - Zakat (chapters 164-178)
 * - Hajj (chapter 179)
 * - Transactions (chapters 180-193)
 * - Loans (chapter 205)
 */

export interface IslamicChapter {
  chapterNum: number;
  title: string;
  content: string;
  topics: string[];
}

export const ISLAMIC_CHAPTERS: IslamicChapter[] = [
  {
    chapterNum: 164,
    title: "Alms Tax (Zakat)",
    content: `Ruling 1871. Zakat is obligatory (wājib) on ten things:
1. wheat;
2. barley;
3. dates;
4. raisins;
5. gold;
6. silver;
7. camels;
8. cows;
9. sheep [and goats];
10. business goods, based on obligatory precaution (al-iḥtiyāṭ al-wājib).

If someone owns one of these ten things, then, given the conditions that will be mentioned below, he must pay the specified amount in one of the prescribed ways.`,
    topics: ["zakat", "obligatory", "wealth"],
  },
  {
    chapterNum: 166,
    title: "Conditions for zakat to become obligatory (wājib)",
    content: `Zakat becomes obligatory when wealth reaches the nisab (minimum threshold) and has been held for one complete lunar year (haul). The owner must be a sane adult Muslim with full ownership of the wealth.`,
    topics: ["zakat", "conditions", "obligation", "nisab"],
  },
  {
    chapterNum: 168,
    title: "The taxable limit (niṣāb) for gold",
    content: `The nisab for gold is 20 mithqals, which is equivalent to approximately 85 grams of pure gold. When gold reaches this amount and has been owned for one year, zakat of 2.5% becomes obligatory on its value.`,
    topics: ["zakat", "nisab", "gold", "threshold"],
  },
  {
    chapterNum: 169,
    title: "The niṣāb for silver",
    content: `The nisab for silver is 200 dirhams, which is equivalent to approximately 595 grams of pure silver. The same rules apply as for gold regarding haul and rate.`,
    topics: ["zakat", "nisab", "silver", "threshold"],
  },
  {
    chapterNum: 172,
    title: "Distribution of zakat",
    content: `Zakat must be distributed to one or more of the eight categories (asnaf) mentioned in the Quran: the poor (fuqara), the needy (masakin), zakat collectors (amilin), those whose hearts are to be reconciled (muallafa), freeing slaves (riqab), those in debt (gharimin), in the cause of Allah (fi sabilillah), and travelers in need (ibn al-sabil).`,
    topics: ["zakat", "distribution", "asnaf", "recipients"],
  },
  {
    chapterNum: 176,
    title: "The fiṭrah alms tax (zakāt al-fiṭrah)",
    content: `Zakatul Fitr is obligatory upon every Muslim who possesses sustenance for himself and his family for the day and night of Eid. It must be paid before the Eid prayer. The amount is typically one handful of food per person.`,
    topics: ["zakat", "fitr", "eid", "obligatory"],
  },
  {
    chapterNum: 179,
    title: "Hajj",
    content: `Hajj is obligatory (wajib) once in a lifetime for every Muslim who has the physical ability and financial means to perform it. Financial means includes having enough for the journey and to support dependents during absence. It is recommended to prepare spiritually and financially for this sacred pilgrimage.`,
    topics: ["hajj", "pilgrimage", "obligation"],
  },
  {
    chapterNum: 180,
    title: "Buying and Selling",
    content: `For a sale to be valid, there must be: 1) A willing seller and buyer, 2) Clear subject matter, 3) A known price, 4) Delivery capability, 5) Avoidance of prohibited elements like riba and gharar. The transaction formula (sigha) must be properly executed.`,
    topics: ["transactions", "buying", "selling", "commerce"],
  },
  {
    chapterNum: 182,
    title: "Disapproved (makrūh) transactions",
    content: `Certain transactions are disapproved (makruh) in Islam including selling at excessive profit, speculation, and unclear terms. While not completely forbidden, these should be avoided as they may lead to disputes and injustice.`,
    topics: ["transactions", "disapproved", "makruh"],
  },
  {
    chapterNum: 183,
    title: "Unlawful (ḥarām) transactions",
    content: `The following transactions are prohibited (haram): 1) Transactions involving riba (interest), 2) Transactions involving gharar (excessive uncertainty), 3) Gambling and speculation, 4) Trading in prohibited goods (alcohol, pork, weapons for oppression), 5) Deceitful trading practices. These are completely forbidden and must be avoided.`,
    topics: ["transactions", "haram", "prohibited", "riba", "gharar", "maysir"],
  },
  {
    chapterNum: 184,
    title: "Conditions relating to the seller and the buyer",
    content: `Both the seller and buyer must have legal capacity to enter into contracts. They must be sane, adult, and have full authority over the items being transacted. Transactions by minors, the mentally incapacitated, or those without authority are void.`,
    topics: ["transactions", "seller", "buyer", "conditions"],
  },
  {
    chapterNum: 188,
    title: "Immediate exchange (naqd) and credit (nasīʾah) transactions",
    content: `Credit sales (bay' bi-thaman ajil) are permissible if the price and payment terms are clearly specified at the time of contract. Increasing the price for deferred payment is allowed, but charging interest on late payments is riba. The terms must be transparent and agreed upon.`,
    topics: ["transactions", "credit", "deferred payment", "riba"],
  },
  {
    chapterNum: 191,
    title: "Selling gold and silver for gold and silver",
    content: `When exchanging gold for gold, or silver for silver, the exchange must be equal in weight and immediate (spot). Any disparity in weight or delay in delivery constitutes riba al-fadl or riba al-nasiah, which is prohibited.`,
    topics: ["transactions", "gold", "silver", "exchange", "riba"],
  },
  {
    chapterNum: 205,
    title: "Loan (Qarḍ)",
    content: `A loan (qard) in Islam must be given without any benefit to the lender. The borrower returns only the principal amount. Any excess is riba and is prohibited. It is strongly recommended (mustahab) to lend to those in genuine need without expecting any return or interest.`,
    topics: ["loans", "qard", "interest-free", "lending"],
  },
];

/**
 * Get a chapter by its number
 */
export function getChapterByNumber(chapterNum: number): IslamicChapter | undefined {
  return ISLAMIC_CHAPTERS.find((ch) => ch.chapterNum === chapterNum);
}

/**
 * Get all chapters for a specific topic
 */
export function getChaptersByTopic(topic: string): IslamicChapter[] {
  return ISLAMIC_CHAPTERS.filter((ch) => ch.topics.includes(topic));
}

/**
 * Get chapter count
 */
export function getTotalChapters(): number {
  return ISLAMIC_CHAPTERS.length;
}
