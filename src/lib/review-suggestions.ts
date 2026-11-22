export interface SuggestionItem {
  topic: string;
  text: string;
}

export interface SuggestionOptions {
  category?: string;
  subcategory?: string;
  filter?: string;
  language?: 'en' | 'hi';
  sessionSeed?: number;
}

type RatingLevel = 1 | 2 | 3 | 4 | 5;

interface RatingSuggestionPool {
  topics: [string, string, string];
  variations: [string[], string[], string[]];
}

// English Templates by Category and Rating
const EN_TEMPLATES: Record<string, Record<RatingLevel, RatingSuggestionPool>> = {
  dining: {
    5: {
      topics: ['Food & Taste', 'Service & Staff', 'Overall Experience'],
      variations: [
        [
          'The food was outstanding, full of authentic flavors and beautifully presented.',
          'Incredible culinary quality; every dish we ordered was fresh, hot, and delicious.',
          'Exceptional taste and generous portions. Easily one of the best dining experiences around.',
        ],
        [
          'The staff were remarkably courteous, attentive, and made our table feel warmly welcomed.',
          'Prompt and polite service throughout our meal. The team checked in at just the right times.',
          'Friendly and knowledgeable staff who gave great recommendations and served everything swiftly.',
        ],
        [
          'Wonderful atmosphere and delightful hospitality. Will definitely return with friends and family!',
          'A top-notch five-star dining experience from beginning to end. Highly recommended!',
          'Fantastic ambience, great food, and flawless hospitality. Five stars all the way!',
        ],
      ],
    },
    4: {
      topics: ['Food Quality', 'Service Flow', 'Overall Impression'],
      variations: [
        [
          'Very good food with great flavors. A satisfying meal that lived up to expectations.',
          'Delicious and fresh dishes overall; quality was high with just minor room for extra seasoning.',
          'Thoroughly enjoyed the food; hearty portions and great presentation throughout.',
        ],
        [
          'The service was polite and welcoming, though there was a brief wait during peak hours.',
          'Friendly staff who attended to us well, with only slight delays on drink refills.',
          'Helpful and professional team. Service was smooth and pleasant overall.',
        ],
        [
          'A solid 4-star experience with great hospitality. We enjoyed our visit and will come again.',
          'Really pleasant dining atmosphere and good value. Glad we stopped by.',
          'Great place for a meal with family or colleagues. Overall very pleased with our visit.',
        ],
      ],
    },
    3: {
      topics: ['Food & Flavor', 'Service Pace', 'Overall Impression'],
      variations: [
        [
          'The food was decent and met basic expectations, though nothing particularly stood out.',
          'Average flavors and portion sizes. Acceptable for a quick bite, but room for improvement.',
          'Some items were flavorful while others felt ordinary. Fair quality for the price.',
        ],
        [
          'Service was standard; the staff were courteous but somewhat slow to respond during our meal.',
          'The team was polite, but took longer than expected to take our order and bring the bill.',
          'Basic service provided. It was okay, but attentiveness could be improved.',
        ],
        [
          'A fair visit overall with mixed impressions. Good potential if consistency improves.',
          'Decent dining spot, but needs better consistency between food quality and service speed.',
          'An average visit. Neither bad nor exceptional, met routine expectations.',
        ],
      ],
    },
    2: {
      topics: ['Food Shortcomings', 'Service Delays', 'Overall Feedback'],
      variations: [
        [
          'The food was underwhelming; several dishes arrived lukewarm and lacked flavor.',
          'Disappointed with the quality of the meal today. It did not match the menu descriptions.',
          'Taste and preparation fell short of expectations. The kitchen needs better quality control.',
        ],
        [
          'Service was slow and disorganized. We had to ask multiple times for basic orders.',
          'Staff appeared overwhelmed and inattentive, leading to long waits between courses.',
          'Poor coordination on the floor. Our table was largely unattended throughout the visit.',
        ],
        [
          'A disappointing experience overall. Hope management addresses the service and kitchen delays.',
          'Not satisfied with our visit today. Substantial improvements are needed to justify the price.',
          'Expected much better given the reputation. A frustrating dining experience today.',
        ],
      ],
    },
    1: {
      topics: ['Poor Quality', 'Unresponsive Service', 'Unsatisfactory Visit'],
      variations: [
        [
          'Very poor food quality; dishes were stale and improperly prepared.',
          'Completely unsatisfied with the meal. Quality was unacceptable and concerns were dismissed.',
          'Extremely disappointed with what was served. We could barely finish our order.',
        ],
        [
          'Rude and unresponsive staff. No effort was made to resolve our complaints.',
          'Terrible service from arrival to departure. Staff showed no concern for basic customer courtesy.',
          'Completely ignored by the floor team. Unprofessional and chaotic handling throughout.',
        ],
        [
          'An extremely frustrating visit. Would not recommend based on our experience today.',
          'Deeply disappointed with the standards here. A completely unsatisfactory experience.',
          'Unacceptable quality and service. Will not be returning.',
        ],
      ],
    },
  },
  hospitality: {
    5: {
      topics: ['Stay & Comfort', 'Staff & Hospitality', 'Overall Experience'],
      variations: [
        [
          'Immaculate room, extremely comfortable bed, and top-tier amenities throughout our stay.',
          'Peaceful, spotless room with excellent climate control and a restful night of sleep.',
          'Outstanding comfort and pristine cleanliness. Every detail in the room was thoughtfully arranged.',
        ],
        [
          'The front desk and housekeeping teams were remarkably warm, courteous, and efficient.',
          'Exceptional hospitality from check-in to check-out. The staff anticipated every need.',
          'Staff members went out of their way to make our stay comfortable and stress-free.',
        ],
        [
          'A flawless five-star hospitality experience. We will definitely make this our preferred stay!',
          'Wonderful ambience and top-notch facilities. Highly recommended to any traveler.',
          'Everything about our visit was superb. Exceptional hospitality and great value!',
        ],
      ],
    },
    4: {
      topics: ['Room & Cleanliness', 'Service & Check-in', 'Overall Impression'],
      variations: [
        [
          'Clean, comfortable room with good amenities. Everything needed for a restful stay.',
          'Very pleasant and tidy accommodations. Quiet environment and comfortable bedding.',
          'Well-kept rooms with good facilities, just minor signs of routine wear.',
        ],
        [
          'Check-in was smooth and staff were welcoming, with just a minor delay at the reception desk.',
          'Helpful and polite staff who addressed our questions promptly and courteously.',
          'Good service and friendly team members throughout our stay.',
        ],
        [
          'A very enjoyable and dependable stay. We were pleased and would gladly book again.',
          'Great location, solid comfort, and good hospitality. Very happy overall.',
          'A positive 4-star experience with comfortable rooms and helpful customer service.',
        ],
      ],
    },
    3: {
      topics: ['Room Standards', 'Front Desk Pace', 'Overall Impression'],
      variations: [
        [
          'The room was okay for a short stay, but basic amenities felt minimal.',
          'Average room comfort. Cleanliness was acceptable, but furnishings felt dated.',
          'Met basic needs for an overnight visit, though soundproofing could be improved.',
        ],
        [
          'Front desk service was standard; check-in took longer than expected during peak hours.',
          'Staff were polite but somewhat detached; assistance took some time when requested.',
          'Routine service without much personalization. Acceptable but not memorable.',
        ],
        [
          'A fair stay that met basic requirements. Potential is there with better upkeep.',
          'An ordinary visit overall. Decent for brief travel, but room for refinement.',
          'Standard experience for the price point. Neither exceptional nor unpleasant.',
        ],
      ],
    },
    2: {
      topics: ['Room Issues', 'Service Lapses', 'Overall Feedback'],
      variations: [
        [
          'The room fell below expectations; maintenance issues and cleanliness left much to be desired.',
          'Uncomfortable stay due to noise and inadequate climate control. Needs attention.',
          'Room was not properly prepared upon arrival; bathroom amenities were missing.',
        ],
        [
          'Front desk staff were slow to respond to requests and seemed indifferent to our concerns.',
          'Customer service was disorganized; resolving simple billing questions took too long.',
          'Lack of communication from the team during our stay made things inconvenient.',
        ],
        [
          'Disappointing experience that did not match the listing. Needs significant improvement.',
          'Fell well short of acceptable hospitality standards today. Hope management rectifies this.',
          'Not a restful stay. Disappointed with the overall service and upkeep.',
        ],
      ],
    },
    1: {
      topics: ['Unacceptable Room', 'Unhelpful Staff', 'Unsatisfactory Stay'],
      variations: [
        [
          'Unacceptable room condition. Dirty surfaces and broken fixtures throughout.',
          'Terrible accommodations; strong odors and total lack of basic cleanliness.',
          'The room was completely unready and unhygienic. An unacceptable experience.',
        ],
        [
          'Staff were unhelpful and dismissive when we reported issues with our room.',
          'Completely unprofessional front desk management. No accountability shown whatsoever.',
          'Rude and uncooperative staff who made our stay stressful and unpleasant.',
        ],
        [
          'Extremely frustrating experience. Would not recommend this property to anyone.',
          'A completely disappointing stay from check-in to check-out. Will never return.',
          'Horrible service and unhygienic conditions. Worst hospitality experience we have had.',
        ],
      ],
    },
  },
  general: {
    5: {
      topics: ['Professional Care', 'Efficiency & Quality', 'Overall Recommendation'],
      variations: [
        [
          'Outstanding professionalism and attention to detail from the entire team.',
          'The staff were welcoming, courteous, and demonstrated exceptional expertise.',
          'Superb customer care and clear communication from start to finish.',
        ],
        [
          'Fast, seamless, and high-quality experience. Everything was handled impeccably.',
          'Top-tier standards and spotless facilities. Exceeded our expectations in every way.',
          'Prompt and organized handling of our visit. Everything was executed flawlessly.',
        ],
        [
          'A true five-star experience all around. Highly recommended to anyone looking for quality!',
          'Extremely impressed with the dedication and service. Will definitely be a regular customer.',
          'Exceptional service and great value. Five stars without hesitation!',
        ],
      ],
    },
    4: {
      topics: ['Staff & Service', 'Quality & Standards', 'Overall Impression'],
      variations: [
        [
          'Very good service and polite staff who guided us through everything smoothly.',
          'Courteous and professional team members who handled our visit with care.',
          'Helpful and attentive service with good communication throughout.',
        ],
        [
          'Great quality and well-maintained premises. Everything was orderly and clean.',
          'Smooth and pleasant experience with reliable standards and fair value.',
          'High standards maintained overall, with just minor room for small improvements.',
        ],
        [
          'A solid and enjoyable experience that we were very pleased with. Glad to recommend!',
          'Very good overall visit. We appreciate the friendly approach and will return.',
          'Dependable and quality service that leaves a positive impression.',
        ],
      ],
    },
    3: {
      topics: ['Service Delivery', 'Wait & Process', 'Overall Impression'],
      variations: [
        [
          'An average experience overall. The staff were polite, but service felt a bit rushed.',
          'Fair customer service that met basic requirements without standing out.',
          'Standard assistance provided. The team was okay, though could be more engaged.',
        ],
        [
          'The overall process took a bit longer than anticipated, but quality was acceptable.',
          'Decent standards, though some aspects felt routine for the price charged.',
          'Met routine expectations. Nothing negative, but nothing particularly memorable.',
        ],
        [
          'A fair visit with mixed impressions. Good potential with better customer focus.',
          'An ordinary experience overall. Acceptable, but room for noticeable improvement.',
          'Standard visit that met basic expectations. Decent overall.',
        ],
      ],
    },
    2: {
      topics: ['Service Delays', 'Quality Shortfall', 'Overall Feedback'],
      variations: [
        [
          'Quite disappointed with the visit. The staff seemed inattentive and uncoordinated.',
          'Customer service was sluggish and basic requests took far too long to address.',
          'Staff communication was poor and our visit felt disorganized from the start.',
        ],
        [
          'The quality of service fell well below what was promised. Needs serious attention.',
          'Expectations were not met today. Basic care and attention were missing.',
          'Lacked attention to detail and efficiency. Disappointing outcome overall.',
        ],
        [
          'Not satisfied with the outcome today. Hope management takes feedback to heart.',
          'Fell short of reasonable standards. Substantial improvements are needed.',
          'Expected much better based on reviews. A disappointing experience.',
        ],
      ],
    },
    1: {
      topics: ['Poor Treatment', 'Unacceptable Service', 'Critical Feedback'],
      variations: [
        [
          'Extremely poor customer service. Staff were completely unresponsive and indifferent.',
          'Unprofessional and dismissive staff who showed no regard for customer concerns.',
          'Rude and unhelpful interaction throughout. Total lack of basic courtesy.',
        ],
        [
          'The service was completely unacceptable and expectations were not met at all.',
          'Waste of time and money. Poor standards and zero effort to fix clear mistakes.',
          'Terrible execution and broken commitments. Highly dissatisfied.',
        ],
        [
          'A completely frustrating and unsatisfactory experience. Will not be returning.',
          'Deeply disappointed with the lack of ethics and professionalism here.',
          'Would not recommend to anyone based on our terrible experience today.',
        ],
      ],
    },
  },
};

// Hindi Templates by Category and Rating
const HI_TEMPLATES: Record<RatingLevel, SuggestionPool> = {
  5: {
    topics: ['उत्कृष्ट सेवा', 'गुणवत्ता और माहौल', 'समग्र अनुभव'],
    variations: [
      [
        'शुरुआत से अंत तक बेहतरीन सेवा। कर्मचारी बहुत विनम्र, सहयोगी और मददगार थे।',
        'यहाँ के स्टाफ का व्यवहार बहुत सम्मानजनक और पेशेवर था। सेवा बहुत तेज़ थी।',
        'अद्भुत मेहमाननवाज़ी और बहुत सहयोगी टीम। हमें यहाँ आकर बहुत अच्छा लगा।',
      ],
      [
        'उत्कृष्ट गुणवत्ता और बहुत सुंदर व स्वच्छ वातावरण। सब कुछ उम्मीद से बेहतर रहा।',
        'साफ़-सफ़ाई और व्यवस्था काबिले-तारीफ़ थी। हर चीज़ बहुत व्यवस्थित थी।',
        'उच्च स्तर की गुणवत्ता और शानदार परिवेश। पूरा माहौल बहुत सुखद था।',
      ],
      [
        'वाकई एक सच्चा 5-स्टार अनुभव। हम इसे सभी को सुझाएंगे और जल्द दोबारा आएंगे!',
        'शानदार अनुभव और पूरा पैसा वसूल। 5 स्टार रेटिंग के पूरी तरह हक़दार!',
        'यहाँ का अनुभव यादगार रहा। परिवार और दोस्तों के साथ आने के लिए उत्तम स्थान!',
      ],
    ],
  },
  4: {
    topics: ['अच्छी सेवा', 'गुणवत्ता और सुविधा', 'समग्र अनुभव'],
    variations: [
      [
        'काफी अच्छी सेवा रही। कर्मचारी बहुत मिलनसार थे, बस थोड़ी व्यस्तता के कारण हल्का समय लगा।',
        'स्टाफ का व्यवहार बहुत अच्छा और मददगार था। काम समय पर पूरा हुआ।',
        'सहयोगी कर्मचारी और अच्छा तालमेल। कुल मिलाकर सेवा से संतुष्ट रहे।',
      ],
      [
        'अनुभव काफी सुखद और गुणवत्तापूर्ण रहा। छोटी-मोटी चीज़ों में और सुधार की गुंजाइश है।',
        'साफ़-सुथरी जगह और अच्छी सुविधाएं। व्यवस्था संतोषजनक थी।',
        'उचित मूल्य पर अच्छा अनुभव मिला। गुणवत्ता मानक के अनुसार थी।',
      ],
      [
        'कुल मिलाकर बहुत संतोषजनक यात्रा रही। हम दोबारा आना पसंद करेंगे।',
        'एक अच्छा 4-स्टार अनुभव। ज्यादातर चीज़ें बहुत अच्छी रहीं।',
        'सकारात्मक अनुभव रहा। दोस्तों और परिचितों को ज़रूर सुझाएंगे।',
      ],
    ],
  },
  3: {
    topics: ['सामान्य सेवा', 'सुविधा और मानक', 'समग्र अनुभव'],
    variations: [
      [
        'सामान्य अनुभव रहा। कर्मचारी ठीक थे लेकिन सेवा में थोड़ा धीमापन था जिसे सुधारा जा सकता है।',
        'स्टाफ सामान्य रूप से सहयोगी था, लेकिन सेवा में थोड़ी और तत्परता की आवश्यकता है।',
        'औसत स्तर की सेवा मिली। कोई खास कमी नहीं थी, पर कुछ खास भी नहीं लगा।',
      ],
      [
        'बुनियादी अपेक्षाएं पूरी हुईं, लेकिन कुछ चीज़ें सामान्य स्तर की थीं। सुधार की आवश्यकता है।',
        'सुविधाएं सामान्य थीं। कीमत के अनुसार अनुभव औसत रहा।',
        'काम चलाऊ व्यवस्था थी। गुणवत्ता को थोड़ा और बेहतर किया जा सकता है।',
      ],
      [
        'ठीक-ठाक अनुभव रहा। अगर प्रबंधन गति और ध्यान पर काम करे तो काफी बेहतर हो सकता है।',
        'एक औसत यात्रा रही। न बहुत अच्छी और न ही खराब, सामान्य अपेक्षाएं पूरी हुईं।',
        'संतोषजनक लेकिन साधारण अनुभव। सुधार की उम्मीद है।',
      ],
    ],
  },
  2: {
    topics: ['सेवा में कमी', 'अपेक्षा से कम', 'सुधार की आवश्यकता'],
    variations: [
      [
        'अनुभव काफी निराशाजनक रहा। सेवा बहुत धीमी थी और तालमेल की कमी साफ नज़र आई।',
        'कर्मचारियों का ध्यान ग्राहकों पर नहीं था और छोटी-छोटी चीज़ों के लिए इंतज़ार करना पड़ा।',
        'स्टाफ का सहयोग असंतोषजनक रहा। समस्याओं पर समय रहते ध्यान नहीं दिया गया।',
      ],
      [
        'हमारी अपेक्षाओं के अनुरूप नहीं था। बुनियादी सुविधाओं और ध्यान में सुधार की सख्त जरूरत है।',
        'गुणवत्ता में काफी गिरावट दिखी। जैसा सोचा था, वैसा बिल्कुल नहीं मिला।',
        'व्यवस्था काफी अव्यवस्थित थी जिससे हमें असुविधा का सामना करना पड़ा।',
      ],
      [
        'आज की व्यवस्था से बिल्कुल संतुष्ट नहीं हैं। उम्मीद है प्रबंधन इस पर गंभीरता से ध्यान देगा।',
        'निराशाजनक अनुभव रहा। स्तर को सुधारने के लिए काफी काम करने की आवश्यकता है।',
        'उम्मीद के मुताबिक नहीं रहा। हम इस अनुभव से संतुष्ट नहीं हैं।',
      ],
    ],
  },
  1: {
    topics: ['खराब सेवा', 'असंतोषजनक व्यवस्था', 'गंभीर शिकायत'],
    variations: [
      [
        'बहुत ही निराशाजनक अनुभव। समस्याओं पर कोई ध्यान नहीं दिया गया और सेवा स्तर बेहद असंतोषजनक था।',
        'कर्मचारियों का व्यवहार रूखा और असहयोगी था। बुनियादी ग्राहक शिष्टाचार का पूरी तरह अभाव था।',
        'शिकायत करने के बावजूद किसी ने मदद नहीं की। अत्यंत गैर-ज़िम्मेदाराना रवैया रहा।',
      ],
      [
        'शुरुआत से अंत तक भारी असुविधा हुई। बुनियादी ग्राहक सेवा और व्यावसायिकता की भारी कमी दिखी।',
        'पूरी तरह से समय और पैसे की बर्बादी। जो वादा किया गया था, वह बिल्कुल नहीं मिला।',
        'बेहद खराब गुणवत्ता और अव्यवस्था। किसी भी मानक पर खरा नहीं उतरा।',
      ],
      [
        'बिल्कुल असंतोषजनक अनुभव रहा। हम किसी को भी यहाँ आने की सलाह नहीं देंगे।',
        'अत्यधिक निराशाजनक स्थिति। सेवा और व्यवस्था में बुनियादी सुधार की तत्काल आवश्यकता है।',
        'हमारा अनुभव बहुत खराब रहा और हम दोबारा कभी नहीं आएंगे।',
      ],
    ],
  },
};

interface SuggestionPool {
  topics: [string, string, string];
  variations: [string[], string[], string[]];
}

function resolveCategoryKey(category?: string): 'dining' | 'hospitality' | 'general' {
  if (!category) return 'general';
  const cat = category.toLowerCase();
  if (
    cat.includes('restaurant') ||
    cat.includes('cafe') ||
    cat.includes('dining') ||
    cat.includes('food') ||
    cat.includes('bakery') ||
    cat.includes('lounge') ||
    cat.includes('bar')
  ) {
    return 'dining';
  }
  if (
    cat.includes('hotel') ||
    cat.includes('resort') ||
    cat.includes('stay') ||
    cat.includes('accommodation') ||
    cat.includes('motel') ||
    cat.includes('hospitality') ||
    cat.includes('inn')
  ) {
    return 'hospitality';
  }
  return 'general';
}

/**
 * Returns exactly 3 distinct, contextually appropriate review suggestions
 * tailored specifically to the selected star rating (1, 2, 3, 4, or 5).
 * Guaranteed to never duplicate within a set and varied across sessions.
 */
export function getInstantSuggestions(
  rating: number,
  options: SuggestionOptions = {}
): SuggestionItem[] {
  const safeRating: RatingLevel = (
    Math.max(1, Math.min(5, Math.round(rating || 5))) as RatingLevel
  );
  const lang = options.language === 'hi' ? 'hi' : 'en';

  if (lang === 'hi') {
    const pool = HI_TEMPLATES[safeRating];
    const seed = options.sessionSeed ?? Math.floor(Math.random() * 100);
    return [
      {
        topic: pool.topics[0],
        text: pool.variations[0][seed % pool.variations[0].length],
      },
      {
        topic: pool.topics[1],
        text: pool.variations[1][(seed + 1) % pool.variations[1].length],
      },
      {
        topic: pool.topics[2],
        text: pool.variations[2][(seed + 2) % pool.variations[2].length],
      },
    ];
  }

  const categoryKey = resolveCategoryKey(options.category);
  const pool = EN_TEMPLATES[categoryKey][safeRating];
  const seed = options.sessionSeed ?? Math.floor(Math.random() * 100);

  // Apply optional topic filter preference if matching
  const filter = (options.filter || '').toLowerCase();
  let topic1 = pool.topics[0];
  let topic2 = pool.topics[1];
  let topic3 = pool.topics[2];

  if (filter.includes('atmosphere')) {
    topic1 = 'Atmosphere & Vibe';
  } else if (filter.includes('service') || filter.includes('staff')) {
    topic1 = 'Service & Staff';
  } else if (filter.includes('quality') || filter.includes('food')) {
    topic2 = categoryKey === 'dining' ? 'Food & Taste' : 'Quality & Comfort';
  }

  return [
    {
      topic: topic1,
      text: pool.variations[0][seed % pool.variations[0].length],
    },
    {
      topic: pool.topics[1],
      text: pool.variations[1][(seed + 1) % pool.variations[1].length],
    },
    {
      topic: pool.topics[2],
      text: pool.variations[2][(seed + 2) % pool.variations[2].length],
    },
  ];
}
