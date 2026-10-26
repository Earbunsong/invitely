import { PrismaClient, Prisma } from "@prisma/client";
import { invitationDataSchema, type InvitationData } from "../src/lib/invitation";

const prisma = new PrismaClient();

const u = (id: string, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

const weddingPhotos = [
  u("1519741497674-611481863552"),
  u("1511285560929-80b456fea0bc"),
  u("1465495976277-4387d4b0b4c6"),
  u("1606800052052-a08af7148866"),
  u("1583939003579-730e3918a45a"),
  u("1522673607200-164d1b6ce486"),
  u("1519225421980-715cb0215aed"),
];

const weddingSchedule: InvitationData["schedule"] = [
  { time: "06:30", icon: "monk", title: { en: "Monk blessing ceremony", km: "ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត" } },
  { time: "07:30", icon: "gift", title: { en: "Groom's procession", km: "ពិធីហែជំនូន" } },
  { time: "09:00", icon: "heart", title: { en: "Hair-cutting ceremony", km: "ពិធីកាត់សក់បង្កក់សិរី" } },
  { time: "10:30", icon: "ring", title: { en: "Knot-tying blessing", km: "ពិធីសំពះផ្ទឹម និងចងដៃ" } },
  { time: "12:00", icon: "food", title: { en: "Lunch reception", km: "អញ្ជើញពិសាអាហារថ្ងៃត្រង់" } },
  { time: "17:00", icon: "toast", title: { en: "Wedding dinner party", km: "អញ្ជើញពិសាភោជនាហារពេលល្ងាច" } },
];

const demos: { slug: string; templateId: string; plan: string; data: unknown }[] = [
  {
    slug: "demo",
    templateId: "garden-gate",
    plan: "wedding-premium",
    data: {
      eventType: "wedding",
      title: { en: "The Wedding Of", km: "សិរីមង្គលអាពាហ៍ពិពាហ៍" },
      hosts: [
        { en: "Dara Sok", km: "សុខ ដារា" },
        { en: "Sreymom Chan", km: "ចាន់ ស្រីមុំ" },
      ],
      parents: {
        left: { father: { en: "Sok Vannak", km: "សុខ វណ្ណៈ" }, mother: { en: "Keo Sophal", km: "កែវ សុផល" } },
        right: { father: { en: "Chan Rith", km: "ចាន់ ឫទ្ធិ" }, mother: { en: "Lim Sokha", km: "លឹម សុខា" } },
      },
      date: "2026-12-27",
      time: "17:00",
      venue: {
        name: { en: "Sokha Grand Ballroom", km: "សណ្ឋាគារ សុខា" },
        address: { en: "Chroy Changvar, Phnom Penh", km: "ជ្រោយចង្វារ រាជធានីភ្នំពេញ" },
        mapQuery: "Sokha Phnom Penh Hotel",
      },
      message: {
        en: "Together with our families, we joyfully invite you to celebrate our wedding and share in the happiness of our special day.",
        km: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ សម្តេច ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា អញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ក្នុងពិធីអាពាហ៍ពិពាហ៍ របស់កូនប្រុស និងកូនស្រីរបស់យើងខ្ញុំ។",
      },
      thanks: {
        en: "Thank you for your love and blessings. Your presence means the world to us. Please forgive any shortcomings in our invitation.",
        km: "យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅ ចំពោះវត្តមាន និងពរជ័យរបស់លោកអ្នក។ សូមអភ័យទោសរាល់ការខ្វះខាតទាំងឡាយ។",
      },
      schedule: weddingSchedule,
      loveStory: [
        { year: "2019", title: { en: "First met", km: "ជួបគ្នាដំបូង" }, text: { en: "At a friend's birthday in Phnom Penh.", km: "នៅក្នុងពិធីខួបកំណើតមិត្តភក្តិ។" } },
        { year: "2022", title: { en: "First trip", km: "ដំណើរកម្សាន្តដំបូង" }, text: { en: "Sunrise at Angkor Wat together.", km: "មើលថ្ងៃរះនៅអង្គរវត្ត។" } },
        { year: "2025", title: { en: "The proposal", km: "ការស្នើសុំ" }, text: { en: "She said yes on the Kep coast.", km: "នាងបាននិយាយថា «បាទ/ចាស» នៅឆ្នេរកែប។" } },
      ],
      coverPhoto: weddingPhotos[0],
      photos: weddingPhotos,
      colors: ["#b5835a", "#e8a33d", "#f2d16b", "#a678c4", "#c43b4a"],
      dressCode: { en: "Traditional or formal attire", km: "សម្លៀកបំពាក់ប្រពៃណី ឬផ្លូវការ" },
      musicUrl: "",
      defaultLocale: "km",
    },
  },
  {
    slug: "demo-royal",
    templateId: "royal-gold",
    plan: "wedding-premium",
    data: {
      eventType: "wedding",
      title: { en: "The Wedding Of", km: "សិរីមង្គលអាពាហ៍ពិពាហ៍" },
      hosts: [
        { en: "Visal Heng", km: "ហេង វិសាល" },
        { en: "Bopha Ly", km: "លី បុប្ផា" },
      ],
      date: "2027-01-16",
      time: "07:00",
      venue: { name: { en: "Diamond Island Convention Center", km: "មជ្ឈមណ្ឌលសន្និបាតកោះពេជ្រ" }, address: { en: "Koh Pich, Phnom Penh", km: "កោះពេជ្រ ភ្នំពេញ" }, mapQuery: "Diamond Island Convention and Exhibition Center" },
      message: { en: "With great joy we invite you to our wedding celebration.", km: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញចូលរួមពិធីអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ។" },
      schedule: weddingSchedule.slice(0, 4),
      coverPhoto: weddingPhotos[4],
      photos: weddingPhotos.slice(3, 7),
      colors: ["#7a2236", "#e3b65c", "#f6e3b4"],
      defaultLocale: "en",
    },
  },
  {
    slug: "demo-birthday",
    templateId: "birthday-pop",
    plan: "birthday-premium",
    data: {
      eventType: "birthday",
      title: { en: "You're invited to", km: "សូមអញ្ជើញចូលរួម" },
      hosts: [{ en: "Mia's Birthday", km: "ខួបកំណើត មីយ៉ា" }],
      age: 7,
      date: "2026-12-12",
      time: "15:00",
      venue: { name: { en: "Aeon Mall Sen Sok — Kids Zone", km: "អ៊ីអន សែនសុខ" }, address: { en: "Sen Sok, Phnom Penh", km: "សែនសុខ ភ្នំពេញ" }, mapQuery: "AEON Mall Sen Sok City" },
      message: { en: "Join us for cake, games and lots of fun!", km: "សូមអញ្ជើញមកញ៉ាំនំខេក និងលេងល្បែងសប្បាយៗជាមួយគ្នា!" },
      schedule: [
        { time: "15:00", icon: "star", title: { en: "Games & activities", km: "ល្បែងកម្សាន្ត" } },
        { time: "16:30", icon: "cake", title: { en: "Cake cutting", km: "កាត់នំខួបកំណើត" } },
        { time: "17:00", icon: "food", title: { en: "Snacks & dinner", km: "អាហារពេលល្ងាច" } },
      ],
      coverPhoto: u("1530103862676-de8c9debad1d"),
      photos: [u("1530103862676-de8c9debad1d"), u("1513151233558-d860c5398176"), u("1464349095431-e9a21285b5f3")],
      colors: ["#ff7aa2", "#ffd166", "#7cc6fe"],
      dressCode: { en: "Wear something colorful!", km: "ស្លៀកពាក់ពណ៌ចម្រុះ!" },
      defaultLocale: "en",
    },
  },
  {
    slug: "demo-house",
    templateId: "home-sweet",
    plan: "housewarming",
    data: {
      eventType: "housewarming",
      title: { en: "House Warming", km: "ពិធីឡើងផ្ទះថ្មី" },
      hosts: [{ en: "The Kim Family", km: "គ្រួសារ គឹម" }],
      date: "2026-12-20",
      time: "10:00",
      venue: { name: { en: "Our new home", km: "គេហដ្ឋានថ្មីរបស់យើង" }, address: { en: "Borey Peng Huoth, Phnom Penh", km: "បុរីប៉េងហួត ភ្នំពេញ" }, mapQuery: "Borey Peng Huoth The Star Natural" },
      message: { en: "We've moved! Come celebrate our new home with us.", km: "យើងខ្ញុំសូមគោរពអញ្ជើញចូលរួមពិធីឡើងផ្ទះថ្មីរបស់យើងខ្ញុំ។" },
      schedule: [
        { time: "07:00", icon: "monk", title: { en: "Monk blessing", km: "ពិធីសូត្រមន្ត" } },
        { time: "10:00", icon: "home", title: { en: "Open house", km: "ទទួលភ្ញៀវ" } },
        { time: "11:30", icon: "food", title: { en: "Lunch", km: "អាហារថ្ងៃត្រង់" } },
      ],
      coverPhoto: u("1600585154340-be6161a56a0c"),
      photos: [u("1600585154340-be6161a56a0c"), u("1564013799919-ab600027ffc6"), u("1558618666-fcd25c85cd64")],
      colors: ["#c8643b", "#7fa070", "#f6e2d6"],
      defaultLocale: "en",
    },
  },
];

async function main() {
  for (const d of demos) {
    const data = invitationDataSchema.parse(d.data) as unknown as Prisma.InputJsonValue;
    await prisma.invitation.upsert({
      where: { slug: d.slug },
      update: { templateId: d.templateId, plan: d.plan, data, status: "PUBLISHED" },
      create: { slug: d.slug, templateId: d.templateId, plan: d.plan, data, status: "PUBLISHED", publishedAt: new Date() },
    });
  }
  const demo = await prisma.invitation.findUniqueOrThrow({ where: { slug: "demo" } });
  await prisma.guest.upsert({ where: { token: "demo-guest" }, update: {}, create: { invitationId: demo.id, name: "Mr. Bunsong", token: "demo-guest" } });
  await prisma.promoCode.upsert({ where: { code: "WELCOME10" }, update: {}, create: { code: "WELCOME10", percentOff: 10, maxUses: 100 } });
  console.log(`Seeded ${demos.length} demo invitations, 1 guest, promo WELCOME10`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
