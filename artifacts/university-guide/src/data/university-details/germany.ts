import { text, type SchoolDetail } from './types';

export const germanDetails: Record<string, SchoolDetail> = {
  'Ruprecht-Karls-Universität Heidelberg': {
    city: text('Гейдельберг', 'Heidelberg'),
    tuitionSummary: text('€1 500 за семестр для большинства студентов вне ЕС и ЕЭЗ', '€1,500/semester for most non-EU/EEA students'),
    tuition: text('€1 500 за семестр для студентов вне ЕС/ЕЭЗ с иностранным документом о предыдущем образовании. Это €3 000 за два семестра только за обучение; семестровые взносы оплачиваются дополнительно. Есть законодательно установленные исключения, в том числе для обладателей немецкого документа о доступе к высшему образованию.', '€1,500 per semester for non-EU/EEA students with a foreign university entrance qualification, or €3,000 for two semesters in tuition alone. Semester contributions are additional. Statutory exemptions include holders of a German university entrance qualification.'),
    admission: text('Все программы первого высшего образования преподаются на немецком. Обычно к зачислению нужен DSH-2 или признанный эквивалент, например TestDaF с TDN 4 во всех частях; отдельные программы требуют более высокого уровня. Право на поступление и конкурс проверяются по конкретной программе.', 'All undergraduate degree programmes are taught in German. Enrolment normally requires DSH-2 or a recognized equivalent, such as TestDaF TDN 4 in all sections; some programmes require a higher level. Entrance eligibility and selection depend on the programme.'),
    funding: text('Возможны исключения и освобождения от платы по установленным основаниям. Для освобождения по квоте университета на первый семестр опубликованы сроки 15 июля для зимнего и 15 января для летнего семестра. Освобождение не означает оплату расходов на жизнь.', 'Statutory exemptions and university fee waivers are available under specific conditions. Published first-semester university-quota waiver deadlines are 15 July for winter and 15 January for summer. A tuition waiver does not cover living expenses.'),
    application: text('Проверьте процедуру и сроки выбранной программы отдельно от срока заявки на освобождение от платы. Языковой сертификат должен быть готов к указанному университетом этапу подачи или зачисления.', 'Check the programme application process and deadlines separately from fee-waiver deadlines. Have the language certificate ready at the required application or enrolment stage.'),
    exams: ['secondary', 'language'], priceBand: 'low', checkedAt: '2026-11-07',
    sources: [
      { label: 'Heidelberg — tuition and exemptions', url: 'https://www.uni-heidelberg.de/en/study/management-of-studies/tuition-fees/tuition-fees-for-international-students' },
      { label: 'Heidelberg — teaching language and accepted certificates', url: 'https://www.uni-heidelberg.de/en/study/international-studies/language-requirements-for-international-students' },
    ],
  },
  'Rheinisch Westfälische Technische Hochschule Aachen': {
    city: text('Ахен', 'Aachen'),
    tuitionSummary: text('€0 за обычное обучение + обязательный семестровый взнос', '€0 standard tuition + mandatory semester contribution'),
    tuition: text('RWTH подтверждает отсутствие дополнительной платы за обучение для иностранных студентов вне ЕС: для обычных программ обязателен семестровый взнос. Его точная сумма публикуется AStA и может меняться. Не переносите это правило на платные специальные программы.', 'RWTH confirms that international non-EU students do not pay additional tuition for standard programmes; a semester contribution is required. The current amount is published by AStA and can change. Do not apply this rule to fee-charging special programmes.'),
    admission: text('Нужен признанный документ о доступе к высшему образованию. Для соответствующих иностранных абитуриентов требуется эквивалент немецкой средней оценки 2,5 или лучше; предусмотрено исключение через TestAS. Бакалавриат преподаётся на немецком: к зачислению нужен C1; некоторые программы также требуют английский B2.', 'A recognized university entrance qualification is required. Applicable international applicants need a German-equivalent average of 2.5 or better, with a TestAS exception available. Bachelor programmes are taught in German and require C1 at enrolment; some also require English B2.'),
    funding: text('Отсутствие платы за обучение не покрывает семестровый взнос, страховку и жизнь. Официальный раздел Financing Your Studies содержит варианты финансирования; конкретная стипендия и её получение здесь не гарантируются.', 'Tuition-free study does not cover the semester contribution, insurance or living costs. The official Financing Your Studies section provides funding guidance; no particular scholarship or award is guaranteed here.'),
    application: text('Подача документов проходит через RWTHonline. Для отдельных иностранных аттестатов может понадобиться Studienkolleg или предварительное обучение в своей стране. Список документов и сроки выбирайте на странице нужной программы.', 'Apply through RWTHonline. Some foreign school qualifications require Studienkolleg or prior university study in the home country. Check documents and deadlines for the selected programme.'),
    exams: ['secondary', 'language'], priceBand: 'low', checkedAt: '2026-11-07',
    sources: [
      { label: 'RWTH — fees and financing policy', url: 'https://www.rwth-aachen.de/go/id/bqmn/lidx/1' },
      { label: 'RWTH — international bachelor admission requirements', url: 'https://www.rwth-aachen.de/go/id/drar/lidx/1' },
      { label: 'RWTH — costs and semester contribution', url: 'https://www.rwth-aachen.de/go/id/bqmo/lidx/1' },
    ],
  },
  'Freie Universität Berlin': {
    city: text('Берлин', 'Berlin'),
    tuitionSummary: text('€0 за обычное обучение + €376,80 за семестр · зима 2026/27', '€0 standard tuition + €376.80/semester · winter 2026/27'),
    tuition: text('Обычные программы не облагаются платой за обучение; исключение — программы дополнительного образования. Для нового зачисления зимой 2026/27 взнос составляет €376,80, включая административный, социальный, студенческий взносы и транспортный билет для соответствующих студентов.', 'Standard programmes have no tuition fees, except continuing education programmes. New enrolment in winter 2026/27 requires €376.80, covering administrative, social and student contributions and the transport ticket for eligible students.'),
    admission: text('С иностранным документом о доступе к высшему образованию обычно сначала нужна VPD от uni-assist, оформленная именно для FU Berlin. Затем подаётся заявление в портал университета. Есть исключения из требования VPD; язык и дополнительные условия проверяются по программе.', 'Foreign university entrance qualifications generally require a uni-assist VPD issued specifically for FU Berlin, followed by an application through the university portal. VPD exemptions exist; language and additional requirements depend on the programme.'),
    funding: text('Нулевая плата за обычное обучение не означает полного финансирования: семестровый взнос и расходы на жизнь остаются. Универсальная стипендия для всех иностранных поступающих в проверенных источниках не подтверждена.', 'No standard tuition does not mean full funding: semester contributions and living costs remain. The checked sources do not establish a universal scholarship for all international entrants.'),
    application: text('uni-assist обычно обрабатывает VPD 4–6 недель, а в загруженные периоды дольше. К сроку университета нужна полная заявка с действующей VPD; одной подачи в uni-assist недостаточно.', 'uni-assist normally takes 4–6 weeks to process a VPD and longer in peak periods. The university must receive a complete application with a valid VPD by its deadline; applying to uni-assist alone is not enough.'),
    exams: ['secondary', 'language'], priceBand: 'low', checkedAt: '2026-11-07',
    sources: [
      { label: 'FU Berlin — fees and winter 2026/27 contributions', url: 'https://www.fu-berlin.de/en/studium/studieren/studienorganisation/gebuehren/index.html' },
      { label: 'FU Berlin — application with foreign qualifications and VPD', url: 'https://www.fu-berlin.de/en/studium/bewerbung/bachelor/ausl-hzb/index.html' },
    ],
  },
  'Universität Hamburg': {
    city: text('Гамбург', 'Hamburg'),
    tuitionSummary: text('€0 за обычное обучение + обязательный семестровый взнос', '€0 standard tuition + mandatory semester contribution'),
    tuition: text('Университет отменил обычную плату за обучение, но семестровый взнос остаётся обязательным. Точная сумма для выбранного семестра здесь не подтверждена — проверьте официальную страницу взносов; €0 не означает отсутствие всех расходов.', 'The university abolished standard tuition fees, but the semester contribution remains mandatory. The exact contribution for your semester has not been verified here; check the official fee page. €0 tuition does not mean no expenses.'),
    admission: text('Для иностранных аттестатов, как правило, требуется признание образовательных документов через портал университета. Дополнительные языковые требования и правила конкурсного отбора зависят от предмета. Следуйте именно инструкции для Bachelor / Staatsexamen с иностранным документом.', 'Foreign school qualifications normally require recognition through the university portal. Additional language and selection requirements depend on the subject. Follow the Bachelor / Staatsexamen instructions for holders of foreign qualifications.'),
    funding: text('Подтверждённая стипендия для этой карточки пока не добавлена. Планируйте оплату семестрового взноса и жизни самостоятельно до получения конкретного решения о финансовой поддержке.', 'No verified scholarship has been added to this profile yet. Budget for the semester contribution and living expenses until you receive a specific funding decision.'),
    application: text('Заявление подаётся онлайн. Нужные документы загружаются в портал; университет прямо предупреждает, что бумажные документы для этой процедуры отправлять не нужно. Сроки проверяйте для выбранной программы и категории поступающего.', 'Apply online and upload the required documents to the portal. The university explicitly says not to send paper documents for this process. Check deadlines for the selected programme and applicant category.'),
    exams: ['secondary', 'language'], priceBand: 'low', checkedAt: '2026-11-07',
    sources: [
      { label: 'Hamburg — tuition and semester contribution', url: 'https://www.uni-hamburg.de/en/campuscenter/studienorganisation/studienverlauf/beitraege-gebuehren.html' },
      { label: 'Hamburg — international bachelor applications', url: 'https://www.uni-hamburg.de/campuscenter/bewerbung/international/studium-mit-abschluss.html' },
    ],
  },
};
