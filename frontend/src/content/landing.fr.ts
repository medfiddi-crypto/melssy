export const landing = {
  sectionOrder: ["ugc", "reviews"] as const,
  hero: {
    headline: "Vos cheveux, protégés toute la nuit",
    body: "Un coffret complet en satin — taies, bonnet et chouchous — pour limiter les frottements pendant votre sommeil. Livré partout au Maroc, payé à la livraison.",
    priceCaption: "paiement à la livraison",
  },
  order: {
    productLabel: "Coffret Beauty Night Ritual",
    nameLabel: "Nom complet",
    nameError: "Saisissez votre nom complet.",
    phoneLabel: "Téléphone",
    phonePlaceholder: "06 00 00 00 00",
    phoneError: "Saisissez un numéro mobile marocain valide commençant par 06 ou 07.",
    reassurance: "Un rituel complet, un paiement à la livraison, une confirmation avec notre équipe.",
    submitting: "Enregistrement...",
    error: "Votre commande n'a pas pu être enregistrée. Veuillez réessayer.",
  },
  ctas: {
    completeRitual: "Complétez votre rituel",
    viewOrderForm: "Voir le formulaire",
  },
  upsell: {
    title: "Une seconde paire ?",
    body: "Une paire de taies satinées en plus, pour la chambre d'amis ou pour offrir. Ajoutée à votre commande, livrée ensemble.",
    accept: "Oui, ajouter à ma commande",
    decline: "Non merci, continuer",
  },
  problem: {
    eyebrow: "Le problème",
    title: "La nuit ne devrait pas effacer ce que vous avez pris le temps de faire.",
    body: "Frottements, frisottis, boucles aplaties, longueurs moins nettes: l'oreiller peut transformer votre coiffure pendant que vous dormez. Le matin ne peut pas toujours rattraper huit heures de nuit.",
  },
  bundle: {
    eyebrow: "Dans la boîte",
    title: "Le rituel complet, prêt pour ce soir.",
    body: "Deux taies satinées, un bonnet satiné, deux chouchous satinés et un boucleur sans chaleur offert.",
  },
  satinComparison: {
    eyebrow: "Pourquoi le satin",
    headline: "Votre oreiller travaille contre vos cheveux pendant huit heures.",
    subheadline: "Et le matin, vous accusez vos cheveux.",
    blocks: [
      {
        lead: "Le coton absorbe. C'est son métier.",
        text: "On fabrique les serviettes en coton pour une raison : il boit l'eau. Votre taie d'oreiller fait exactement la même chose, huit heures par nuit. L'huile que vous appliquez le soir, l'hydratation de votre masque, votre crème de nuit — une partie finit dans le tissu. Le satin, lui, n'absorbe rien. Ce que vous mettez sur vos cheveux y reste.",
      },
      {
        lead: "Vous bougez 20 à 40 fois par nuit.",
        text: "Pas une fois. Des dizaines. À chaque mouvement, vos cheveux sont traînés sur la trame du coton — une grille rugueuse, invisible à l'œil nu. Le satin n'a pas de trame en relief : les cheveux glissent au lieu d'accrocher.",
      },
      {
        lead: "Les frisottis ne viennent pas de nulle part.",
        text: "Votre cheveu est couvert d'écailles superposées, comme des tuiles. La friction les soulève. Des écailles soulevées, c'est précisément ça, un frisottis. Voilà pourquoi vos cheveux sont souvent moins beaux au réveil qu'au moment où vous vous êtes couchée.",
      },
    ],
    closing: "Ce n'est pas de la soie. C'est du satin 100% polyester, choisi précisément parce qu'il n'absorbe pas et qu'il supporte le lavage. Nous préférons vous le dire.",
    imageAlt: "Comparaison macro entre une trame de coton et une trame de satin, côte à côte",
  },
  comparison: {
    eyebrow: "MELSSY et le reste",
    title: "Un rituel pensé, pas un essentiel choisi au hasard.",
    melssyLabel: "MELSSY",
    genericLabel: "Générique",
    melssy: "Des pièces coordonnées, pensées pour se compléter dans votre soirée.",
    generic: "Un accessoire isolé, sans rituel clair ni expérience pensée autour de votre nuit.",
  },
  preview: {
    eyebrow: "Aperçu de mise en page",
    ugcTitle: "Vos vidéos clientes.",
    ugcCards: [
      { name: "Prénom", quote: "Aperçu d'un témoignage vidéo." },
      { name: "Prénom", quote: "Aperçu d'un témoignage vidéo." },
      { name: "Prénom", quote: "Aperçu d'un témoignage vidéo." },
      { name: "Prénom", quote: "Aperçu d'un témoignage vidéo." },
      { name: "Prénom", quote: "Aperçu d'un témoignage vidéo." },
      { name: "Prénom", quote: "Aperçu d'un témoignage vidéo." },
    ],
    reviewsTitle: "Avis clientes.",
    reviewsBody: "Aperçu réservé à la validation de mise en page.",
  },
  faq: [
    ["Comment se passe le paiement?", "Vous réglez votre commande à la livraison, après confirmation avec notre équipe."],
    ["Où livrez-vous?", "Nous livrons partout au Maroc. Les modalités précises sont confirmées avant l'envoi."],
    ["Le rituel convient-il à tous les cheveux?", "Il est conçu comme un geste de douceur pour les longueurs et les coiffures. Il ne remplace pas un avis ou un soin professionnel."],
    ["Comment entretenir les pièces?", "Les conseils d'entretien définitifs seront précisés avec les informations matière vérifiées avant lancement."],
  ],
  ritual: {
    eyebrow: "Le rituel",
    title: "Un geste qui suit votre soirée.",
    steps: ["Attachez avec douceur", "Préparez vos boucles", "Enveloppez vos longueurs", "Posez-vous, simplement"],
  },
  masthead: {
    brand: "MELSSY",
  },
  faqSection: {
    eyebrow: "Questions fréquentes",
    title: "Avant de commander.",
  },
  finalOrder: {
    eyebrow: "La Beauty Night Ritual™",
    title: "Le dernier geste de votre journée.",
  },
  collection: {
    eyebrow: "La collection",
    title: "Les essentiels de nuit.",
    view: "Voir la collection",
    discover: "Découvrir",
  },
  footer: {
    descriptor: "Beauty Sleep Ritual",
    links: ["Notre histoire", "Collections", "Nous contacter"],
  },
} as const;