export const profile = {
  name: 'Mangesh Bodke',
  greeting: 'I enjoy learning new technology and shipping it in the product.',
  title: 'SDE-1 @ ProsParity',
  focus: 'Frontend Developer · EV Fintech',
  skillsLine: 'React.js · JavaScript · TypeScript · REST APIs · UI Development',
  location: 'Pune, Maharashtra',
  email: 'mangeshbodke2025@gmail.com',
  github: 'https://github.com/Mangeshbodke17',
  linkedin: 'https://linkedin.com/in/mangeshbodke',
  // FILL later: public resume URL (PDF). Empty hides the Resume button.
  resumeUrl: '',
}

export type ExperienceSlide = {
  id: string
  label: string
  body: string
}

export type ExperienceProduct = {
  id: string
  title: string
  work: string[]
  topics: ExperienceSlide[]
}

export type ExperienceItem = {
  id: string
  role: string
  company: string
  place: string
  dates: string
  type: string
  mode: 'Onsite' | 'WFH'
  slides: ExperienceSlide[]
  work?: string[]
  topics?: ExperienceSlide[]
  products?: ExperienceProduct[]
}

export const experience: ExperienceItem[] = [
  {
    id: 'exp-prosparity',
    role: 'Software Development Engineer I',
    company: 'ProsParity',
    place: 'Navi Mumbai',
    dates: 'Dec 2025 – Present',
    type: 'Full-time',
    mode: 'Onsite',
    slides: [],
    products: [
      {
        id: 'los',
        title: 'Loan Origination System',
        work: [
      'Loan Origination System (LOS) at ProsParity. Built the frontend from scratch and still own it.',
      'One place for every vehicle loan, from the first login through disbursement and the checks after the money goes out.',
      'Each file holds the applicant, co-applicant, guarantor, and references, with identity, contact, and address details.',
      'Shows the vehicle, the dealer, and the loan terms: amount, down payment, interest, tenure, EMI, fees, and the amount disbursed.',
      'Credit reviews the bureau picture at two levels and approves or rejects the loan.',
      'Operations reviews the file before sanction, before disbursement, and after it, and can pass the loan or reject it.',
      'Holds the full document set: KYC, income and ownership proof, invoice, insurance, vehicle photos, registration certificate, and the field-visit report with its location.',
      'Walks each loan through a fixed journey: lead, sanction, field check, verification, e-sign, auto-debit, disbursement, life insurance, and RC upload.',
      'Shows the rules result, rejection reasons, comments, and an activity log, and limits each role to the steps it is allowed to work.',
      'Includes the application pipeline with stage counts, analytics on logins, rejections, and disbursals, and admin reports.',
      'Also covers stamp-paper inventory and master-data import for dealers, OEMs, and products.',
    ],
    topics: [
      {
        id: 'stack',
        label: 'Stack',
        body: 'React 19, TypeScript, and Vite. React Router 7 keeps every page behind login. MUI for the UI. Redux Toolkit caches the rules result. PDF.js opens documents in a worker. REST to the LOS API, with the files on S3.',
      },
      {
        id: 'rules',
        label: 'Rules',
        body: 'Redux Toolkit stores the rules-engine result for each loan. Opening that tab again shows the cached result immediately, then a small changes call updates it only when the result has actually changed.',
      },
      {
        id: 'tabs',
        label: 'Tabs',
        body: 'A loan file loads a section only when that tab is open. Details, documents, photos, the rules result, and the activity log are separate requests, so opening a file does not pull every section at once.',
      },
      {
        id: 'list',
        label: 'List',
        body: 'The application list is paged on the server. Search waits until typing pauses, so each keystroke does not hit the API.',
      },
      {
        id: 'return',
        label: 'Return',
        body: 'Page, filters, and sort stay in memory when you open a loan and come back, so the list returns as you left it.',
      },
      {
        id: 'journey',
        label: 'Journey',
        body: 'The loan’s journey status is fetched once and shared across the pipeline, the workflow, and the step locks. Permission for a step is cached, and opening that step again reuses it.',
      },
      {
        id: 'pdfs',
        label: 'PDFs',
        body: 'PDFs render in a background worker, with zoom and pan on the page already loaded, so the screen stays responsive while a document opens.',
      },
      {
        id: 'requests',
        label: 'Requests',
        body: 'A request is dropped when you switch loan or tab, so a slow response cannot overwrite the screen you are on.',
      },
        ],
      },
      {
        id: 'collections',
        title: 'Collection App',
        work: [
          'One place for every disbursed vehicle loan, so a relationship manager can see what is still due and what was collected.',
          'Each file shows the applicant, the vehicle, the dealer, the lender, the branch, and the RM, with the overdue amount, the status, the amount collected, and the latest comment.',
          'The month opens on a progress board: overdue, partially paid, EMI paid, and EMI with charges, in count or amount, split by how late the loan is. Choosing a cell filters the list.',
          'Promises to pay split into today, missed, later, and not set. A visit filter shows who still needs a field visit.',
          'From the loan, the RM calls the customer in the app, then records the reason, a comment, and a promise-to-pay date.',
          'Payments are recorded on the loan, including cash in hand. Cash is deposited with proof, and a payment stays pending until an admin approves it.',
          'The same file holds comments, field visits with their location, the loan details, and the documents. A case can be marked problematic or passed to a third party.',
          'Relationship managers mark attendance from their location: at a dealer, on a collection visit, at the office, or somewhere else.',
          'Collection analytics shows aging buckets, visits, and target against achievement, by state, branch, team lead, and RM. Reports export collection, visits, calls, cash, attendance, transactions, and the repayment schedule.',
          'An RM works the assigned list. A team lead and operations can review transactions. An admin approves pending payments and manages users.',
        ],
        topics: [
          {
            id: 'stack',
            label: 'Stack',
            body: 'React 18, TypeScript, and Vite. Tailwind and Radix for the UI, React Router behind login. React context, not Redux. ECharts and Recharts for charts, SheetJS for Excel, Leaflet for attendance, TeleCMI for calls, JWT login, and Capacitor for Android.',
          },
          {
            id: 'state',
            label: 'State',
            body: 'This app does not use Redux. Login, the live call, and list updates sit in React context. Cascading filter results sit in a memory cache. Analytics filters sit in session storage for the browser tab.',
          },
          {
            id: 'list',
            label: 'List',
            body: 'The loan list is paged on the server, 20 at a time. The same page and filters are not requested twice.',
          },
          {
            id: 'filters',
            label: 'Filters',
            body: 'Branch, team lead, RM, dealer, and lender filters cascade from the server. A result is kept for two minutes, a repeat reuses it, and a fast series of changes waits briefly so each click does not fire its own call.',
          },
          {
            id: 'status',
            label: 'Status',
            body: 'Status, promise-to-pay dates, and call status for the loans on the current page are fetched together. If the page changes, the previous request is dropped.',
          },
          {
            id: 'screens',
            label: 'Screens',
            body: 'Analytics, attendance, transactions, and admin settings load only when that screen is opened. The loan file loads only when a row is opened. Field visits load with that tab.',
          },
          {
            id: 'refresh',
            label: 'Refresh',
            body: 'Collection progress refreshes on a timer. It stops while a loan is open, while the browser tab is hidden, and after the user has been idle. A response for an older filter is ignored.',
          },
          {
            id: 'row',
            label: 'Row',
            body: 'A status change, a collected amount, or a promise-to-pay date updates the row already on screen, so the list does not reload for what the RM just saved.',
          },
          {
            id: 'call',
            label: 'Call',
            body: 'The call stays in one session above every screen. The RM can leave the loan, keep the call, and come back to save the reason, the comment, and the promise date.',
          },
          {
            id: 'analytics',
            label: 'Analytics',
            body: 'On analytics, changing the filters cancels the request already in flight, so a slow answer cannot overwrite the view now on screen. The chosen filters stay until the browser tab is closed.',
          },
          {
            id: 'rows',
            label: 'Rows',
            body: 'List rows are memoized, so a change to one loan does not redraw every row. A new frontend build asks the user to refresh instead of leaving them on an old screen.',
          },
        ],
      },
    ],
  },
  {
    id: 'exp-fortune',
    role: 'Frontend Developer Intern',
    company: 'Fortune Business Insights',
    place: 'Baner, Pune',
    dates: 'Nov 2025',
    type: 'Internship',
    mode: 'Onsite',
    slides: [],
    work: [
      'UI for one Fortune Business Insights site, the public market-research pages',
      'Industry and report pages: the market, the forecast, and the charts',
      'Sample-request path on a report, so a client can ask for it from that page',
      'Long pages that still read on a phone',
    ],
    topics: [
      {
        id: 'stack',
        label: 'Stack',
        body: 'React, TypeScript, JavaScript, HTML, and CSS for the industry pages, the report, the charts, and the sample request.',
      },
      {
        id: 'memo',
        label: 'useMemo',
        body: 'The market and forecast series are prepared once. A hover or a resize reuses that data instead of building the charts again.',
      },
      {
        id: 'callback',
        label: 'useCallback',
        body: 'The sample-request handler stays the same function, so typing in the form does not redraw the charts beside it.',
      },
      {
        id: 'layout',
        label: 'Layout',
        body: 'Tables and charts stack on a small screen instead of overflowing it. The sample request stays on the report, so the client does not hunt for a second page.',
      },
    ],
  },
  {
    id: 'exp-nsfas',
    role: 'Frontend Developer Intern',
    company: 'NSFAS',
    place: 'South Africa',
    dates: 'Jun 2025 – Oct 2025',
    type: 'Internship',
    mode: 'WFH',
    slides: [],
    work: [
      'Rebuilt the myNSFAS apply → upload → track flow',
      'Multi-step form with validation and draft save',
      'Document upload with type and size checks, and retry',
      'Status tracker with filters and API states',
      'Loading, empty, and error states on every step',
    ],
    topics: [
      {
        id: 'stack',
        label: 'Mongoose',
        body: 'Mongoose, Express, React, and Node. React for apply, upload, and track. Node and Express for the API. Mongoose handles the data for the application.',
      },
      {
        id: 'lazy',
        label: 'Lazy load',
        body: 'Apply, upload, and track are separate screens. React.lazy with Suspense loads a step only when the student reaches it, and the fallback holds the place so the page never opens blank.',
      },
      {
        id: 'split',
        label: 'Code split',
        body: 'Each step is a dynamic import(). The first visit downloads the account and the form. The tracker chunk stays out of that download until it is needed.',
      },
      {
        id: 'bundles',
        label: 'Bundles',
        body: 'React stays in one shared chunk, so it is cached across steps. A change to the tracker does not force the form chunk to download again. Tree-shaking drops component-library code the flow never uses.',
      },
      {
        id: 'render',
        label: 'Render',
        body: 'The active step owns its own state, so a keystroke does not rerender the whole wizard. On the tracker, filter changes run in a transition, and the previous request is aborted so a slow response cannot overwrite a newer one.',
      },
      {
        id: 'scale',
        label: 'Scale',
        body: 'The tracker pages its results instead of painting every application. Upload checks type and size before the request, and a retry resumes without clearing the form. A draft save means a refresh does not lose the application.',
      },
    ],
  },
]

export const skills = [
  {
    group: 'Frontend',
    items: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
  },
  {
    group: 'State & UI',
    items: ['Redux Toolkit', 'Responsive layouts', 'MUI / component libraries'],
  },
  {
    group: 'Backend',
    items: ['Node.js', 'Express', 'REST APIs'],
  },
  {
    group: 'Data & tools',
    items: ['Mongoose', 'Git', 'GitHub'],
  },
]

export const about = {
  stories: [
    {
      id: 'los',
      kicker: 'Now · ProsParity',
      title: 'Loan Origination System',
      body: 'At ProsParity I built the Loan Origination System (LOS) frontend from scratch, and I still own it, adding features and the UI for each one. Every loan application sits in one place: the borrower, the loan, the documents, and where it stands. Credit approves or rejects it, operations can take an approved loan forward or reject it, and each person only sees the steps their role is allowed to work on.',
      steps: [
        { name: 'Application', note: 'Borrower, documents, status' },
        { name: 'Credit', note: 'Approve or reject' },
        { name: 'Operations', note: 'Check, then move it forward' },
      ],
    },
    {
      id: 'collections',
      kicker: 'Also · ProsParity',
      title: 'Collection App',
      body: 'I also worked on ProsParity’s Collection App, which relationship managers use every day to see which loans are still due, record what was collected, follow up with customers, and track how the month’s collection is going.',
      marks: ['Still due', 'Collected', 'Promised to pay', 'Needs a visit'],
    },
    {
      id: 'nsfas',
      kicker: 'Before · South Africa',
      title: 'NSFAS',
      body: 'Before that I worked on NSFAS, South Africa’s government scheme that funds university and college students for tuition, books, and accommodation. A student applies, uploads documents, and tracks the funding status. On myNSFAS they create an account, fill the form, upload files such as an ID and a consent form, submit, and then follow the status.',
      steps: [
        { name: 'Apply', note: 'Account and form' },
        { name: 'Upload', note: 'ID and consent' },
        { name: 'Track', note: 'Funding status' },
      ],
      stamp: 'Rebuilt the NSFAS apply → upload → track flow.',
    },
  ],
  learning: [
    { name: 'SQL', detail: 'How the data behind a screen is actually stored' },
    { name: 'Python', detail: 'A second language, past JavaScript' },
    { name: 'AI', detail: 'I use it while I build, to move faster and improve the product' },
  ],
  education: {
    degree: 'BE',
    college: 'Smt. Kashibai Navale College of Engineering',
    cgpa: 7.8,
    year: '2025',
  },
}

export const nav = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]
