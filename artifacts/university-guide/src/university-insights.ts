import type { University } from './catalog';
import type { Language } from './test-content';
import { additionalSchoolDetails } from './data/university-details';
import { additionalCountryGuides } from './data/country-guides';
import { text, type Insight, type LocalizedText, type ExamKind, type PriceBand } from './data/university-details/types';

export type UniversityReputation = {
  qs2027Rank?: number;
  qsSource?: { label: string; url: string };
  studentReviewRating?: number;
  reviewCount?: number;
  reviewCheckedAt?: string;
  reviewSource?: { label: string; url: string };
};

const REVIEW_DATA_CHECKED_AT = '2026-11-07';

export const REVIEW_FRESHNESS_DAYS = 180;

/** Compare calendar dates in UTC, matching the date-only verification metadata. */
export function isReviewRatingStale(checkedAt: string | undefined, now = new Date()): boolean {
  if (!checkedAt || !/^\d{4}-\d{2}-\d{2}$/.test(checkedAt)) return false;
  const checked = new Date(`${checkedAt}T00:00:00Z`);
  if (!Number.isFinite(checked.getTime()) || !Number.isFinite(now.getTime())) return false;
  if (checked.toISOString().slice(0, 10) !== checkedAt) return false;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return (today - checked.getTime()) / 86_400_000 > REVIEW_FRESHNESS_DAYS;
}

function reputationFromSource(
  url: string,
  qs2027Rank?: number,
  studentReviewRating?: number,
  reviewCount?: number,
  reviewCheckedAt = REVIEW_DATA_CHECKED_AT,
): UniversityReputation {
  return {
    ...(qs2027Rank !== undefined
      ? { qs2027Rank, qsSource: { label: 'QS 2027 · Mastersportal', url } }
      : {}),
    ...(studentReviewRating !== undefined
      ? {
          studentReviewRating,
          ...(reviewCount !== undefined ? { reviewCount } : {}),
          reviewCheckedAt,
          reviewSource: { label: 'Studyportals · Mastersportal', url },
        }
      : {}),
  };
}

export const universityReputationByName: Readonly<Record<string, UniversityReputation>> = {
  'Technische Universität München': reputationFromSource('https://www.mastersportal.com/rankings-reviews/41/technical-university-of-munich.html', 25, 4.0, 100),
  'Ludwig-Maximilians-Universität München': reputationFromSource('https://www.mastersportal.com/rankings-reviews/218/ludwig-maximilians-university-munich.html', 61, 4.1, 100),
  'University of Bologna': reputationFromSource('https://www.mastersportal.com/rankings-reviews/606/university-of-bologna.html', 123, 4.2, 100),
  'University of Roma "La Sapienza"': reputationFromSource('https://www.mastersportal.com/rankings-reviews/642/sapienza-university-of-rome.html', 111, 4.2, 100),
  'University of Toronto': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11734/university-of-toronto.html', 32, 4.1, 100),
  'University of British Columbia': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11804/university-of-british-columbia.html', 45, 4.2, 100),
  'Harvard University': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11731/harvard-university.html', 5, 4.1, 100),
  'Massachusetts Institute of Technology': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11740/massachusetts-institute-of-technology.html', 1, 4.3, 59),
  'University of Oslo': reputationFromSource('https://www.mastersportal.com/rankings-reviews/13/university-of-oslo.html', 131, 4.4, 34),
  'Norwegian University of Science and Technology': reputationFromSource('https://www.mastersportal.com/rankings-reviews/14/norwegian-university-of-science-and-technology.html', 264, 4.3, 39),
  'Rheinisch Westfälische Technische Hochschule Aachen': reputationFromSource('https://www.mastersportal.com/rankings-reviews/47/rwth-aachen-university.html', 104, 4.3),
  'Universität Stuttgart': reputationFromSource('https://www.mastersportal.com/rankings-reviews/48/university-of-stuttgart.html', 318, 4.3),
  'Justus Liebig Universität Gießen': reputationFromSource('https://www.mastersportal.com/rankings-reviews/266/justus-liebig-university-giessen.html', 521, 4.5),
  'Technische Universität Berlin': reputationFromSource('https://www.mastersportal.com/rankings-reviews/278/tu-berlin.html', 158, 3.9),
  'Freie Universität Berlin': reputationFromSource('https://www.mastersportal.com/rankings-reviews/31/freie-universitat-berlin.html', undefined, 4.3),
  'Rheinische Friedrich-Wilhelms Universität Bonn': reputationFromSource('https://www.mastersportal.com/rankings-reviews/45/university-of-bonn.html', undefined, 4.4),
  'Polytechnic Institute of Milan': reputationFromSource('https://www.mastersportal.com/rankings-reviews/601/politecnico-di-milano.html', 87, 4.1),
  'Polytechnic Institute of Turin': reputationFromSource('https://www.mastersportal.com/rankings-reviews/71/politecnico-di-torino.html', 206, 4.2),
  'University of Calabria': reputationFromSource('https://www.mastersportal.com/rankings-reviews/14071/university-of-calabria.html', 851, 4.2),
  'University of Siena': reputationFromSource('https://www.mastersportal.com/rankings-reviews/696/university-of-siena.html', 572, 4.3),
  'University of Roma "Tor Vergata"': reputationFromSource('https://www.mastersportal.com/rankings-reviews/902/tor-vergata-university-of-rome.html', 342, 4.2),
  'University of Trento': reputationFromSource('https://www.mastersportal.com/rankings-reviews/321/university-of-trento.html', undefined, 4.1),
  'University of Padua': reputationFromSource('https://www.mastersportal.com/rankings-reviews/518/university-of-padua.html', undefined, 4.2),
  'University of Pisa': reputationFromSource('https://www.mastersportal.com/rankings-reviews/501/university-of-pisa.html', undefined, 4.1),
  'Simon Fraser University': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11145/simon-fraser-university.html', 312, 4.1),
  'Dalhousie University': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11901/dalhousie-university.html', 298, 4.1),
  'Université de Montréal': reputationFromSource('https://www.mastersportal.com/rankings-reviews/12390/university-of-montreal.html', 162, 4.2),
  'University of Guelph': reputationFromSource('https://www.mastersportal.com/rankings-reviews/12332/university-of-guelph.html', 546, 4.2),
  'University of Windsor': reputationFromSource('https://www.mastersportal.com/rankings-reviews/14215/university-of-windsor.html', 537, 4.4),
  'McGill University': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11742/mcgill-university.html', 30, 4.4),
  'McMaster University': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11744/mcmaster-university.html', undefined, 4.5),
  'Brown University': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11713/brown-university.html', 66, 4.6),
  'Pennsylvania State University': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11761/pennsylvania-state-university.html', 92, 4.5),
  'University of California, Los Angeles': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11795/university-of-california-los-angeles.html', 49, 4.2),
  'University of Memphis': reputationFromSource('https://www.mastersportal.com/rankings-reviews/14249/university-of-memphis.html', 1201, 4.3),
  'Duke University': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11720/duke-university.html', undefined, 4.3),
  'Yale University': reputationFromSource('https://www.mastersportal.com/rankings-reviews/11715/yale-university.html', undefined, 4.2),
  'Norwegian University of Life Sciences': reputationFromSource('https://www.mastersportal.com/rankings-reviews/168/norwegian-university-of-life-sciences.html', 761, 4.4),
  'University of Tromsø': reputationFromSource('https://www.mastersportal.com/rankings-reviews/177/uit-the-arctic-university-of-norway.html', 629, 4.1),
  'University of Bergen': reputationFromSource('https://www.mastersportal.com/rankings-reviews/15/university-of-bergen.html', undefined, 4.1),
  'University of Agder': reputationFromSource('https://www.mastersportal.com/universities/1508/university-of-agder.html', undefined, 4.4),
};

export function getUniversityReputation(university: University) {
  return universityReputationByName[university.name] ?? null;
}

export type UniversitySort = 'default' | 'qs-rank' | 'review-rating';

export function sortUniversities(items: readonly University[], sort: UniversitySort): University[] {
  if (sort === 'default') {
    return [...items].sort((a, b) => {
      const aInsight = getUniversityInsight(a);
      const bInsight = getUniversityInsight(b);
      return Number(Boolean(bInsight && !bInsight.approximate)) - Number(Boolean(aInsight && !aInsight.approximate));
    });
  }

  // Compare only the selected metric, with the same source requirement as the cards.
  return items.flatMap((university) => {
    const reputation = getUniversityReputation(university);
    const value = sort === 'qs-rank' ? reputation?.qs2027Rank : reputation?.studentReviewRating;
    const source = sort === 'qs-rank' ? reputation?.qsSource : reputation?.reviewSource;
    return value !== undefined && Number.isFinite(value) && source
      ? [{ university, value }]
      : [];
  }).sort((a, b) => sort === 'qs-rank' ? a.value - b.value : b.value - a.value)
    .map(({ university }) => university);
}

const countryProfiles: Record<string, Insight> = {
  DE: {
    tuition: {
      ru: 'Ориентир для государственных вузов: часто €0 за обучение, но взимается семестровый взнос; отдельные земли и вузы берут плату с абитуриентов не из ЕС. Примерный бюджет каталога: низкий.',
      en: 'Public-university guide: tuition is often €0, but a semester contribution applies; some states and universities charge non-EU students. Directory budget estimate: low.',
    },
    living: {
      ru: 'Планируйте примерно €1 000–1 400 в месяц. Это оценка для студента, а не средняя по стране; Мюнхен обычно дороже.',
      en: 'Plan for roughly €1,000–1,400 per month. This is a student-budget estimate, not a national average; Munich is usually more expensive.',
    },
    admission: {
      ru: 'Для бакалавриата обычно нужен аттестат, признанный как Hochschulzugangsberechtigung. В зависимости от программы могут потребоваться Studienkolleg, вступительный отбор и немецкий или английский.',
      en: 'Bachelor applicants generally need a school-leaving qualification recognized as a university entrance qualification. A Studienkolleg, selection process, and German or English proof may be required by program.',
    },
    funding: {
      ru: 'Проверьте DAAD, Deutschlandstipendium и стипендии конкретного вуза; право на финансирование зависит от программы и статуса.',
      en: 'Check DAAD, Deutschlandstipendium, and university-specific awards; eligibility depends on program and status.',
    },
    exams: ['secondary', 'language', 'entrance'],
    priceBand: 'low',
    approximate: true,
    sources: [
      { label: 'DAAD: costs and funding', url: 'https://www.daad.de/en/studying-in-germany/living-in-germany/finances/' },
    ],
  },
  IT: {
    tuition: {
      ru: 'Грубый ориентир для государственных вузов: примерно €160–4 000 в год; сумма зависит от дохода семьи, программы и льгот.',
      en: 'Rough guide for public universities: about €160–4,000 per year; the amount depends on family income, program, and exemptions.',
    },
    living: {
      ru: 'Ориентируйтесь примерно на €800–1 300 в месяц; Рим и крупные города обычно дороже небольших городов.',
      en: 'Plan for roughly €800–1,300 per month; Rome and larger cities are generally more expensive than smaller towns.',
    },
    admission: {
      ru: 'Обычно требуются аттестат, соответствующий требованиям к поступлению, и подтверждение языка программы. Для ряда направлений есть конкурсный тест или отбор.',
      en: 'Applicants usually need a qualifying secondary-school diploma and proof of the program language. Some subjects require an entrance test or selection process.',
    },
    funding: {
      ru: 'Ищите региональные стипендии DSU/право на обучение, освобождение или снижение взноса по доходу и гранты университета.',
      en: 'Check regional DSU/right-to-study awards, income-based fee reductions or exemptions, and university grants.',
    },
    exams: ['secondary', 'language', 'entrance'],
    priceBand: 'low',
    approximate: true,
    sources: [
      { label: 'University of Bologna: living costs', url: 'https://www.unibo.it/en/study/life-at-university-and-in-the-city/living-in-the-city/living-costs-in-bologna' },
    ],
  },
  CA: {
    tuition: {
      ru: 'Для иностранных бакалавров ориентир по двум вузам из карточек: CAD 51 500–76 100 в год; программа и кампус меняют сумму.',
      en: 'For international undergraduates, a guide based on the two featured universities is CAD 51,500–76,100 per year; program and campus change the amount.',
    },
    living: {
      ru: 'Ориентир для студента — CAD 1 500–2 500 в месяц без обучения; жильё в Торонто и Ванкувере может заметно повысить расходы.',
      en: 'A student-budget guide is CAD 1,500–2,500 per month excluding tuition; housing in Toronto and Vancouver can raise costs considerably.',
    },
    admission: {
      ru: 'Нужны школьные документы, соответствующие выбранной программе, и подтверждение английского или французского, если оно требуется. У отдельных факультетов есть дополнительные формы и требования.',
      en: 'Applicants need school records matching the chosen program and English or French proficiency where required. Some faculties require additional forms or prerequisites.',
    },
    funding: {
      ru: 'Проверьте вступительные стипендии для иностранных студентов и отдельные факультетские awards; часть заявок рассматривается автоматически, часть требует отдельной подачи.',
      en: 'Check international entrance scholarships and faculty awards; some applications are automatic, while others require a separate submission.',
    },
    exams: ['secondary', 'language', 'entrance'],
    priceBand: 'high',
    approximate: true,
    sources: [
      { label: 'IRCC: proof of funds', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html' },
    ],
  },
  US: {
    tuition: {
      ru: 'Для частных вузов из карточек ориентир составляет около USD 62 000–67 000 только за обучение в год; сборы, жильё и питание оплачиваются отдельно.',
      en: 'For the featured private universities, tuition is about USD 62,000–67,000 per year; fees, housing, and food are additional.',
    },
    living: {
      ru: 'Для студенческого бюджета заложите примерно USD 2 000–3 500 в месяц. Итог сильно зависит от кампуса, жилья и страховки.',
      en: 'Budget roughly USD 2,000–3,500 per month for student living costs. The total depends heavily on campus, housing, and insurance.',
    },
    admission: {
      ru: 'Обычно нужны школьная успеваемость, документы и требования выбранного вуза. Университеты могут учитывать SAT/ACT, дополнительные эссе, рекомендации и подтверждение английского.',
      en: 'Applicants generally need strong school records and required documents. Universities may consider SAT/ACT, supplemental essays, recommendations, and English proficiency.',
    },
    funding: {
      ru: 'Некоторые университеты предоставляют иностранным студентам need-based financial aid; условия различаются. Отдельно проверьте внешние стипендии.',
      en: 'Some universities offer need-based aid to international students; rules vary. Also check external scholarships.',
    },
    exams: ['secondary', 'standardized', 'language', 'entrance'],
    priceBand: 'high',
    approximate: true,
    sources: [
      { label: 'EducationUSA: funding study', url: 'https://educationusa.state.gov/your-5-steps-us-study/finance-your-studies' },
    ],
  },
  NO: {
    tuition: {
      ru: 'Для студентов вне ЕС/ЕЭЗ плата зависит от вуза и программы; грубый ориентир — NOK 150 000–300 000 в год. Исключения и освобождения возможны.',
      en: 'For students outside the EU/EEA, tuition depends on university and program; a rough guide is NOK 150,000–300,000 per year. Exemptions may apply.',
    },
    living: {
      ru: 'Минимальный ориентир на проживание для учебного года 2026/27 в UiO — NOK 170 368 за год (около NOK 14 200 в месяц); реальный бюджет может быть выше.',
      en: 'UiO’s minimum living-funds benchmark for 2026/27 is NOK 170,368 per year (about NOK 14,200 per month); actual costs may be higher.',
    },
    admission: {
      ru: 'Проверяются школьное образование и языковые требования. Большинство бакалаврских программ в Норвегии преподаются на норвежском; предложения на английском ограничены.',
      en: 'School qualifications and language requirements are checked. Most Norwegian bachelor’s programs are taught in Norwegian; English-taught options are limited.',
    },
    funding: {
      ru: 'Университет Осло не предлагает стипендии, покрывающие плату за обучение; NTNU указывает, что обычно не предоставляет стипендии для покрытия платы.',
      en: 'The University of Oslo does not offer scholarships covering tuition; NTNU says it generally does not provide scholarships to cover tuition.',
    },
    exams: ['secondary', 'language', 'entrance'],
    priceBand: 'medium',
    approximate: true,
    sources: [
      { label: 'UiO: tuition and living funds 2026/27', url: 'https://www.uio.no/english/studies/admission/tuition/' },
      { label: 'NTNU: undergraduate FAQ', url: 'https://www.ntnu.edu/studies/faq-undergraduate' },
    ],
  },
};

const schoolInsights: Record<string, Insight> = {
  'Technische Universität München': {
    tuition: { ru: '2026/27: для большинства новых студентов бакалавриата из стран вне ЕС — €2 000 или €3 000 за семестр, в зависимости от программы; дополнительно семестровый взнос. С зимнего семестра 2027/28 объявлено повышение.', en: '2026/27: most newly enrolled non-EU bachelor’s students pay €2,000 or €3,000 per semester depending on program, plus a semester contribution. An increase is announced for winter 2027/28.' },
    living: { ru: 'Примерный бюджет по Германии: €1 000–1 400 в месяц; в Мюнхене жильё может быть дороже среднего.', en: 'Approximate Germany-wide budget: €1,000–1,400 per month; housing in Munich can be above the typical range.' },
    admission: { ru: 'Поступление зависит от программы и признания школьного аттестата. Проверяются язык обучения и возможные дополнительные условия конкретного курса.', en: 'Admission depends on the program and recognition of the school-leaving certificate. Check the teaching-language proof and any program-specific conditions.' },
    funding: { ru: 'TUM перечисляет waiver scholarships и освобождения от платы; они рассматриваются индивидуально и не гарантированы.', en: 'TUM lists waiver scholarships and exemptions; applications are reviewed individually and are not guaranteed.' },
    exams: ['secondary', 'language', 'entrance'], priceBand: 'medium', approximate: false,
    sources: [{ label: 'TUM: tuition and waivers', url: 'https://www.tum.de/en/studies/fees/tuition' }],
  },
  'Ludwig-Maximilians-Universität München': {
    tuition: { ru: 'На 2026/27: обучение в большинстве программ бесплатное; обязательный семестровый взнос составляет €97 за семестр. Условия и сбор могут измениться.', en: 'For 2026/27: most programs have no tuition; the required semester contribution is €97 per semester. Fees may change.' },
    living: { ru: 'Примерный бюджет по Германии: €1 000–1 400 в месяц; Мюнхен относится к дорогим городам для аренды жилья.', en: 'Approximate Germany-wide budget: €1,000–1,400 per month; Munich is among the more expensive cities for rent.' },
    admission: { ru: 'Нужен аттестат, признанный для поступления в немецкий вуз; для бакалавриата обычно требуется немецкий. Для некоторых программ есть отбор и дополнительные условия.', en: 'Applicants need a school qualification recognized for German university entry; bachelor’s programs generally require German. Some programs have selection and additional requirements.' },
    funding: { ru: 'Доступны отдельные стипендии LMU и Deutschlandstipendium; действуют критерии успеваемости и финансовой нуждаемости.', en: 'LMU scholarships and the Deutschlandstipendium are available; academic performance and financial need criteria apply.' },
    exams: ['secondary', 'language', 'entrance'], priceBand: 'low', approximate: false,
    sources: [
      { label: 'LMU: admission prerequisites', url: 'https://www.lmu.de/en/study/degree-students/prerequisites' },
      { label: 'LMU: semester fee 2026/27', url: 'https://www.lmu.de/en/workspace-for-students/abc-study-guide/continuation-of-registration/index.html' },
      { label: 'LMU: international scholarships', url: 'https://www.lmu.de/en/workspace-for-students/student-support-services/finance-your-studies/scholarships/scholarships-for-international-students' },
    ],
  },
  'University of Bologna': {
    tuition: { ru: '2026/27: первый год обычно от €157,04 плюс переменная часть по программе и финансовому положению семьи. Для подходящих иностранных абитуриентов есть фиксированная сниженная плата; проверьте критерии.', en: '2026/27: first-year fees start at €157.04 plus a program- and income-dependent amount. Eligible international applicants may qualify for a reduced fixed fee; check the criteria.' },
    living: { ru: 'Примерный бюджет по Италии: €800–1 300 в месяц; в Болонье расходы зависят прежде всего от аренды жилья.', en: 'Approximate Italy-wide budget: €800–1,300 per month; costs in Bologna depend mainly on rent.' },
    admission: { ru: 'Требуется школьный документ, подходящий для поступления. Отдельные программы проводят вступительный тест или конкурс; иностранные документы проходят проверку.', en: 'A qualifying school-leaving credential is required. Some programs use an entrance test or selection; international credentials are reviewed.' },
    funding: { ru: 'Доступны региональные льготы ER.GO, освобождение или снижение платы по доходу и стипендии; подача заявок и сроки обязательны.', en: 'ER.GO regional benefits, income-based fee reductions or exemptions, and scholarships are available; applications and deadlines apply.' },
    exams: ['secondary', 'language', 'entrance'], priceBand: 'low', approximate: false,
    sources: [
      { label: 'Bologna: 2026/27 fees and exemptions', url: 'https://www.unibo.it/en/study/enrolment-fees-and-other-procedures/degree-programmes/tuition-fees-and-exemptions/fees-and-exemptions-amounts-deadlines' },
      { label: 'Bologna: reduced fee for eligible non-EU students', url: 'https://www.unibo.it/en/study/enrolment-fees-and-other-procedures/degree-programmes/tuition-fees-and-exemptions/reduced-fixed-fee-for-citizens-of-particularly-poor-and-developing-countries-or-non-eu-non-oecd-countries' },
    ],
  },
  'University of Roma "La Sapienza"': {
    tuition: { ru: '2026/27: сумма зависит от программы и финансового положения; для иностранных доходов применяются отдельные правила. Взносы можно платить тремя частями.', en: '2026/27: the fee depends on program and financial circumstances; foreign income has separate rules. Fees can be paid in three instalments.' },
    living: { ru: 'Примерный бюджет по Италии: €800–1 300 в месяц; в Риме бюджет может быть выше из-за аренды и транспорта.', en: 'Approximate Italy-wide budget: €800–1,300 per month; a Rome budget may be higher because of rent and transport.' },
    admission: { ru: 'Нужен подходящий документ о среднем образовании. Для ряда программ требуется тест; для программы на английском или итальянском проверяется соответствующий язык.', en: 'A qualifying secondary-school credential is required. Some programs require a test; the relevant language is checked for English- or Italian-taught programs.' },
    funding: { ru: 'Есть освобождения и льготы по доходу, региональная поддержка и отдельные стипендии; проверьте критерии для иностранных доходов.', en: 'Income-based exemptions and reductions, regional support, and specific scholarships are available; check rules for foreign income.' },
    exams: ['secondary', 'language', 'entrance'], priceBand: 'low', approximate: false,
    sources: [{ label: 'Sapienza: 2026/27 tuition and benefits', url: 'https://www.uniroma1.it/en/node/24520' }],
  },
  'University of Toronto': {
    tuition: { ru: 'Ориентир 2026/27 для иностранных бакалавров: примерно CAD 69 000–76 100 в год в примерах из официального admissions bulletin; программа меняет сумму, сборы могут быть дополнительными.', en: '2026/27 guide for international undergraduates: about CAD 69,000–76,100 per year in examples from the official admissions bulletin; program and additional fees change the total.' },
    living: { ru: 'Примерный студенческий бюджет по Канаде: CAD 1 500–2 500 в месяц без обучения; в Торонто расходы зависят от жилья и кампуса.', en: 'Approximate student budget in Canada: CAD 1,500–2,500 per month excluding tuition; Toronto costs depend on housing and campus.' },
    admission: { ru: 'Оцениваются школьные документы по выбранной программе; отдельные факультеты требуют дополнительные анкеты, предметы или портфолио. Английский подтверждается по правилам университета.', en: 'School records are assessed against the chosen program; some faculties require supplemental applications, prerequisites, or a portfolio. English proficiency follows university rules.' },
    funding: { ru: 'Иностранные первокурсники могут претендовать на отдельные вступительные стипендии; условия и автоматическое рассмотрение зависят от award.', en: 'International first-year applicants may be eligible for specific entrance awards; criteria and automatic consideration vary by award.' },
    exams: ['secondary', 'language', 'entrance'], priceBand: 'high', approximate: false,
    sources: [{ label: 'U of T: 2027–28 international admissions bulletin with 2026/27 fees', url: 'https://future.utoronto.ca/media/1081/download?inline=' }],
  },
  'University of British Columbia': {
    tuition: { ru: '2026/27: для новых иностранных бакалавров в опубликованной таблице — примерно CAD 51 530–66 200 за полный учебный год, в зависимости от программы; специальные направления могут отличаться.', en: '2026/27: the published table for new international undergraduates shows about CAD 51,530–66,200 for a full course load, depending on program; special programs may differ.' },
    living: { ru: 'Примерный студенческий бюджет по Канаде: CAD 1 500–2 500 в месяц без обучения; жильё в Ванкувере может значительно увеличить бюджет.', en: 'Approximate student budget in Canada: CAD 1,500–2,500 per month excluding tuition; Vancouver housing can substantially increase the budget.' },
    admission: { ru: 'Нужны школьные документы и выполнение требований конкретного degree program. Для иностранных абитуриентов проверяется английский; факультеты могут иметь дополнительные условия.', en: 'Applicants need school records and must meet the chosen degree program’s requirements. English is assessed for international applicants; faculties may add conditions.' },
    funding: { ru: 'Проверьте International Scholars Program и вступительные awards; часть наград требует отдельной заявки и подтверждения нуждаемости.', en: 'Check the International Scholars Program and entrance awards; some require a separate application and demonstrated financial need.' },
    exams: ['secondary', 'language', 'entrance'], priceBand: 'high', approximate: false,
    sources: [{ label: 'UBC: 2026/27 undergraduate tuition', url: 'https://students.ubc.ca/enrolment/finances/tuition-fees/undergraduate-tuition-fees' }],
  },
  'Harvard University': {
    tuition: { ru: '2026/27: обучение USD 62 226 в год; полная стоимость выше из-за сборов, проживания, питания и личных расходов.', en: '2026/27: tuition is USD 62,226 per year; the total cost is higher after fees, housing, food, and personal expenses.' },
    living: { ru: 'Примерный студенческий бюджет по США: USD 2 000–3 500 в месяц; в Кембридже/Бостоне расходы на жильё и питание высокие.', en: 'Approximate student budget in the US: USD 2,000–3,500 per month; housing and food costs in Cambridge/Boston are high.' },
    admission: { ru: 'Для первого курса обычно нужны Common Application и дополнительные материалы; Harvard требует SAT или ACT, с оговорёнными исключениями. TOEFL/IELTS не заменяют это требование.', en: 'First-year applicants generally submit the Common Application and supplements; Harvard requires SAT or ACT with stated exceptions. TOEFL/IELTS do not replace that requirement.' },
    funding: { ru: 'Иностранцы имеют доступ к такой же need-based помощи, как граждане США; приём need-blind, подтверждённая нуждаемость может покрываться полностью.', en: 'International students have access to the same need-based aid as US students; admission is need-blind, and demonstrated need is met in full.' },
    exams: ['secondary', 'standardized'], priceBand: 'high', approximate: false,
    sources: [
      { label: 'Harvard: cost and financial aid', url: 'https://college.harvard.edu/financial-aid/how-aid-works' },
      { label: 'Harvard: international applicants', url: 'https://www.college.harvard.edu/admissions/apply/international-applicants' },
    ],
  },
  'Massachusetts Institute of Technology': {
    tuition: { ru: '2026/27: обучение USD 66 720 в год; официальный бюджет полной стоимости обучения — USD 92 760 до финансовой помощи.', en: '2026/27: tuition is USD 66,720 per year; MIT’s published total cost of attendance is USD 92,760 before aid.' },
    living: { ru: 'Примерный студенческий бюджет по США: USD 2 000–3 500 в месяц; бюджет MIT отдельно учитывает жильё, питание и личные расходы.', en: 'Approximate student budget in the US: USD 2,000–3,500 per month; MIT’s budget lists housing, food, and personal expenses separately.' },
    admission: { ru: 'Требуются школьные документы и SAT/ACT; дополнительно оцениваются материалы заявки и соответствие выбранному направлению. Языковые требования проверяйте на странице приёма.', en: 'School records and SAT/ACT are required; application materials and fit with the chosen field are also assessed. Check the admissions page for language requirements.' },
    funding: { ru: 'MIT заявляет, что закрывает подтверждённую финансовую нуждаемость принятых студентов, включая иностранных; размер помощи индивидуален.', en: 'MIT says it meets the demonstrated financial need of admitted students, including international students; aid is individualized.' },
    exams: ['secondary', 'standardized', 'language'], priceBand: 'high', approximate: false,
    sources: [
      { label: 'MIT: cost of attendance 2026/27', url: 'https://sfs.mit.edu/undergraduate-students/the-cost-of-attendance/coa/' },
      { label: 'MIT: undergraduate admissions', url: 'https://mitadmissions.org/apply/firstyear/' },
    ],
  },
  'University of Oslo': {
    tuition: { ru: '2026/27: для иностранцев вне ЕС/ЕЭЗ плата зависит от программы. Университет сообщает точную сумму вместе с предложением о зачислении; указанная в таблице цена одной программы не является общей для всех.', en: '2026/27: fees for students outside the EU/EEA depend on the program. The university gives the exact amount with the offer; one program’s listed price is not universal.' },
    living: { ru: 'Для 2026/27 UiO требует подтвердить NOK 170 368 на проживание за год (около NOK 14 200 в месяц); это визовый минимум, а не гарантия фактической стоимости.', en: 'For 2026/27 UiO requires proof of NOK 170,368 for living expenses per year (about NOK 14,200 per month); this is a visa benchmark, not a guarantee of actual costs.' },
    admission: { ru: 'Проверьте признание школьного образования, язык и доступность программы для международных студентов. Большинство бакалаврских программ требует норвежский; вариантов на английском мало.', en: 'Check recognition of school education, language, and international eligibility for the program. Most bachelor’s programs require Norwegian; English options are limited.' },
    funding: { ru: 'UiO сообщает, что не предлагает стипендии, покрывающие tuition fees; некоторые категории студентов могут получить освобождение от платы.', en: 'UiO says it does not offer scholarships covering tuition; some student categories may qualify for a fee exemption.' },
    exams: ['secondary', 'language', 'entrance'], priceBand: 'medium', approximate: false,
    sources: [
      { label: 'UiO: tuition fees', url: 'https://www.uio.no/english/studies/admission/tuition/' },
      { label: 'UiO: program tuition table', url: 'https://www.uio.no/english/studies/admission/tuition/table-of-costs/index.html' },
    ],
  },
  'Norwegian University of Science and Technology': {
    tuition: { ru: 'Стоимость для иностранцев вне ЕС/ЕЭЗ зависит от программы. Важно: в NTNU нет бакалавриата на английском; для бакалавриата нужно подтвердить норвежский.', en: 'Fees for students outside the EU/EEA depend on the program. Note: NTNU has no bachelor’s degrees taught in English; Norwegian proficiency is required for undergraduate study.' },
    living: { ru: 'Ориентир по Норвегии: от NOK 14 200 в месяц по минимальному ориентиру UiO на 2026/27; для визы нужно подтвердить наличие средств.', en: 'Norway guide: from NOK 14,200 per month using UiO’s 2026/27 minimum benchmark; living funds must be documented for a study permit.' },
    admission: { ru: 'Все бакалаврские программы преподаются на норвежском; нужно подтвердить язык при подаче. Конкретные требования к образованию и отбору указаны для программы.', en: 'All undergraduate programs are taught in Norwegian; proficiency must be documented at application. Program pages list specific academic and selection requirements.' },
    funding: { ru: 'NTNU обычно не предлагает стипендии, покрывающие tuition; доступны ограниченные внешние гранты и исключения по статусу.', en: 'NTNU generally does not offer tuition-covering scholarships; limited external grants and status-based exemptions may apply.' },
    exams: ['secondary', 'language', 'entrance'], priceBand: 'medium', approximate: false,
    sources: [
      { label: 'NTNU: undergraduate FAQ', url: 'https://www.ntnu.edu/studies/faq-undergraduate' },
      { label: 'NTNU: tuition fees', url: 'https://www.ntnu.edu/studies/tuition-fees' },
    ],
  },
};

export type ExamFilter = '' | ExamKind;

export const examOptions: { value: ExamKind; label: LocalizedText }[] = [
  { value: 'secondary', label: { ru: 'Аттестат / школьный диплом', en: 'School-leaving certificate' } },
  { value: 'standardized', label: { ru: 'SAT / ACT', en: 'SAT / ACT' } },
  { value: 'language', label: { ru: 'Языковой экзамен', en: 'Language test' } },
  { value: 'entrance', label: { ru: 'Вступительный тест', en: 'Entrance test' } },
];

export const priceOptions: { value: PriceBand; label: LocalizedText }[] = [
  { value: 'low', label: { ru: 'Низкий · до $5 000 в год', en: 'Low · up to $5,000/year' } },
  { value: 'medium', label: { ru: 'Средний · $5 000–20 000', en: 'Mid · $5,000–20,000/year' } },
  { value: 'high', label: { ru: 'Высокий · более $20 000', en: 'High · over $20,000/year' } },
];

const unknownInsight: Insight = {
    tuition: text('Подтверждённая стоимость для этого вуза пока не найдена.', 'Confirmed tuition for this university has not yet been found.'),
    living: text('', ''),
    admission: text('', ''),
    funding: text('', ''),
    exams: [],
    priceBand: null,
    approximate: true,
    sources: [],
};
const extendedCountryProfiles: Record<string, Insight> = Object.fromEntries(
  Object.entries(additionalCountryGuides).map(([code, guide]) => [code, { ...unknownInsight, ...guide }]),
);

export function getUniversityInsight(university: University): Insight | null {
  const existing = schoolInsights[university.name];
  if (existing) return existing;
  const country = countryProfiles[university.countryCode] ?? extendedCountryProfiles[university.countryCode];
  const detail = additionalSchoolDetails[university.name];
  // Country guides and partial registry metadata must never imply verified
  // institution-specific admissions or costs. Unknown fields stay empty.
  return detail ? { ...unknownInsight, ...country, ...detail, approximate: false } : country ?? unknownInsight;
}

export function getTuitionSummary(university: University, language: Language) {
  const schoolSummaries: Record<string, LocalizedText> = {
    'Technische Universität München': { ru: '€2 000–3 000 за семестр · 2026/27', en: '€2,000–3,000 per semester · 2026/27' },
    'Ludwig-Maximilians-Universität München': { ru: 'Обучение обычно бесплатно + €97 за семестр', en: 'Usually no tuition + €97 semester fee' },
    'University of Bologna': { ru: 'От €157 в год + сумма зависит от программы и дохода', en: 'From €157/year + program- and income-dependent fee' },
    'University of Roma "La Sapienza"': { ru: 'Зависит от программы и дохода · 2026/27', en: 'Depends on program and income · 2026/27' },
    'University of Toronto': { ru: 'CAD 69 000–76 100 в год · ориентир 2026/27', en: 'CAD 69,000–76,100/year · 2026/27 guide' },
    'University of British Columbia': { ru: 'CAD 51 530–66 200 в год · 2026/27', en: 'CAD 51,530–66,200/year · 2026/27' },
    'Harvard University': { ru: 'USD 62 226 в год · обучение · 2026/27', en: 'USD 62,226/year tuition · 2026/27' },
    'Massachusetts Institute of Technology': { ru: 'USD 66 720 в год · обучение · 2026/27', en: 'USD 66,720/year tuition · 2026/27' },
    'University of Oslo': { ru: 'Точная сумма зависит от программы', en: 'Exact amount depends on program' },
    'Norwegian University of Science and Technology': { ru: 'Зависит от программы; бакалавриата на английском нет', en: 'Program-dependent; no English-taught bachelor’s' },
  };
  const countrySummaries: Record<string, LocalizedText> = {
    DE: { ru: 'В госвузах часто €0 за обучение + семестровый взнос', en: 'Often €0 tuition at public universities + semester fee' },
    IT: { ru: 'Примерно €160–4 000 в год', en: 'About €160–4,000/year' },
    CA: { ru: 'Ориентир CAD 51 500–76 100 в год', en: 'Guide: CAD 51,500–76,100/year' },
    US: { ru: 'Ориентир от USD 20 000 в год; зависит от вуза', en: 'Guide: from USD 20,000/year; varies by university' },
    NO: { ru: 'Зависит от вуза и программы', en: 'Varies by university and program' },
  };
  return additionalSchoolDetails[university.name]?.tuitionSummary?.[language] ??
    schoolSummaries[university.name]?.[language] ??
    countrySummaries[university.countryCode]?.[language] ??
    additionalCountryGuides[university.countryCode]?.tuitionSummary?.[language] ??
    null;
}

export function getCountryLivingCost(countryCode: string, language: Language) {
  const ranges: Record<string, LocalizedText> = {
    DE: {
      ru: 'примерно €550–800 в месяц',
      en: 'about €550–800 per month',
    },
    IT: {
      ru: 'примерно €450–700 в месяц',
      en: 'about €450–700 per month',
    },
    CA: {
      ru: 'примерно CAD 700–1 200 в месяц',
      en: 'about CAD 700–1,200 per month',
    },
    US: {
      ru: 'примерно USD 1 000–1 700 в месяц',
      en: 'about USD 1,000–1,700 per month',
    },
    NO: {
      ru: 'примерно NOK 6 000–9 000 в месяц',
      en: 'about NOK 6,000–9,000 per month',
    },
  };
  return ranges[countryCode]?.[language] ?? null;
}

