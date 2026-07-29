export interface Service {
  id: string;
  title: string;
  category: string;
  summary: string;
  price: string;
  featured: boolean;
  order: number;
}

export interface SiteSettings {
  clinicName: string;
  heroEyebrow: string;
  heroTitle: string;
  heroText: string;
  phone: string;
  phoneHref: string;
  address: string;
  hours: string;
  bookingNote: string;
  rating: string;
}

export interface SiteContent {
  settings: SiteSettings;
  services: Service[];
  updatedAt: string;
}

export const defaultServices: Service[] = [
  {
    id: "therapy",
    title: "Терапия и первичный приём",
    category: "Приём",
    summary:
      "Осмотр, сбор анамнеза, постановка предварительного диагноза и понятный план дальнейших действий.",
    price: "Стоимость уточняйте",
    featured: true,
    order: 10,
  },
  {
    id: "diagnostics",
    title: "Диагностика",
    category: "Диагностика",
    summary:
      "Комплексная оценка состояния питомца и исследования, необходимые для точного назначения лечения.",
    price: "от 300 ₽",
    featured: true,
    order: 20,
  },
  {
    id: "laboratory",
    title: "Лабораторные анализы",
    category: "Диагностика",
    summary:
      "Анализы крови и другие исследования, помогающие врачу опираться на объективные показатели.",
    price: "от 300 ₽",
    featured: true,
    order: 30,
  },
  {
    id: "surgery",
    title: "Ветеринарная хирургия",
    category: "Хирургия",
    summary:
      "Плановые и экстренные вмешательства, лечение новообразований и удаление инородных тел.",
    price: "После осмотра",
    featured: true,
    order: 40,
  },
  {
    id: "sterilization-cat",
    title: "Стерилизация кошки",
    category: "Хирургия",
    summary:
      "Подготовка, анестезиологическое сопровождение, операция и рекомендации по восстановлению.",
    price: "от 5 500 ₽",
    featured: false,
    order: 50,
  },
  {
    id: "castration-cat",
    title: "Кастрация кота",
    category: "Хирургия",
    summary:
      "Плановая операция с предварительным осмотром и подробной памяткой по домашнему уходу.",
    price: "от 3 600 ₽",
    featured: false,
    order: 60,
  },
  {
    id: "sterilization-dog",
    title: "Стерилизация и кастрация собак",
    category: "Хирургия",
    summary:
      "Тактика и стоимость подбираются индивидуально с учётом веса, возраста и состояния животного.",
    price: "от 8 000 ₽",
    featured: false,
    order: 70,
  },
  {
    id: "vaccination",
    title: "Вакцинация",
    category: "Профилактика",
    summary:
      "Осмотр перед вакцинацией, подбор схемы и оформление отметок в ветеринарном паспорте.",
    price: "Стоимость уточняйте",
    featured: true,
    order: 80,
  },
  {
    id: "dentistry",
    title: "Ветеринарная стоматология",
    category: "Стоматология",
    summary:
      "Осмотр полости рта, ультразвуковая чистка, лечение дёсен и удаление зубов по показаниям.",
    price: "После осмотра",
    featured: false,
    order: 90,
  },
  {
    id: "dermatology",
    title: "Дерматология",
    category: "Приём",
    summary:
      "Диагностика зуда, воспалений, выпадения шерсти и хронических заболеваний кожи.",
    price: "Стоимость уточняйте",
    featured: false,
    order: 100,
  },
  {
    id: "stationary",
    title: "Стационар и кислородная камера",
    category: "Интенсивная помощь",
    summary:
      "Наблюдение и поддерживающая терапия для животных, которым требуется особое внимание.",
    price: "По назначению врача",
    featured: true,
    order: 110,
  },
  {
    id: "home-visit",
    title: "Вызов врача на дом",
    category: "Выездная помощь",
    summary:
      "Осмотр и базовые процедуры дома, когда перевозка питомца затруднена или нежелательна.",
    price: "По согласованию",
    featured: false,
    order: 120,
  },
];

export const defaultContent: SiteContent = {
  settings: {
    clinicName: "УшкоВет",
    heroEyebrow: "Ветеринарная клиника в Нижнем Новгороде",
    heroTitle: "Слышим тех, кто не может сказать, где болит",
    heroText:
      "Бережная ветеринарная помощь, точная диагностика и честный разговор с владельцем — без лишних назначений и спешки.",
    phone: "+7 (999) 138-54-61",
    phoneHref: "+79991385461",
    address: "Нижний Новгород, Верхне-Печёрская улица, 14",
    hours: "Ежедневно, 10:00–20:00",
    bookingNote: "Приём ведётся по предварительной записи",
    rating: "4,6",
  },
  services: defaultServices,
  updatedAt: "2026-07-28T00:00:00.000Z",
};

export function cloneDefaultContent(): SiteContent {
  return structuredClone(defaultContent);
}
