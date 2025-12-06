export const typeDefs = `#graphql
  type Booking {
    id: ID!
    name: String!
    email: String!
    phone: String!
    service: String!
    date: String!
    time: String!
    address: String!
    numberOfGifts: Int!
    message: String
    status: BookingStatus!
    createdAt: String!
    updatedAt: String!
  }

  enum BookingStatus {
    pending
    in_progress
    ready
    completed
    cancelled
  }

  type DayAvailability {
    date: String!
    slots: [String!]!
    isAvailable: Boolean!
  }

  type DayOfWeekSchedule {
    dayOfWeek: Int!
    slots: [String!]!
    isBlocked: Boolean!
  }

  type Availability {
    availability: [DayAvailability!]!
    dayOfWeekSchedules: [DayOfWeekSchedule!]!
    updatedAt: String!
  }

  type Pricing {
    id: ID!
    name: String!
    description: String
    price: Float!
    priceType: String!
    features: [String!]!
    group: String!
    serviceCategory: String
    active: Boolean!
    order: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Service {
    id: ID!
    title: String!
    subtitle: String
    description: String
    tag: String
    category: String
    active: Boolean!
    order: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Transaction {
    id: ID!
    bookingId: String!
    userId: String
    amount: Float!
    currency: String!
    status: String!
    paymentMethod: String!
    paymentIntentId: String
    metadata: String
    createdAt: String!
    updatedAt: String!
  }

  type User {
    id: ID!
    email: String
    walletAddress: String
    name: String
    role: String!
    transactionHistory: [Transaction!]!
    createdAt: String!
    updatedAt: String!
  }

  enum WorkerType {
    Owner
    Employee
  }

  type Worker {
    id: ID!
    walletAddress: String!
    workerType: WorkerType!
    name: String
    email: String
    phone: String
    packagesCheckedIn: [String!]!
    packagesWrapped: [String!]!
    packagesCompleted: [String!]!
    packagesDroppedOff: [String!]!
    availabilityId: String
    createdAt: String!
    updatedAt: String!
  }

  enum InventoryType {
    wrapping_paper
    bow
    ribbon
    box
  }

  type Inventory {
    id: ID!
    name: String!
    type: InventoryType!
    size: String
    cost: Float!
    quantity: Int!
    unit: String
    supplier: String
    thumbnail: String
    amazonAsin: String
    amazonUrl: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    bookings(status: BookingStatus, date: String): [Booking!]!
    booking(id: ID!): Booking
    availability: Availability!
    availableTimeSlots(date: String!): [String!]!
    isDateAvailable(date: String!): Boolean!
    pricing(active: Boolean, group: String, serviceCategory: String): [Pricing!]!
    pricingItem(id: ID!): Pricing
    services(active: Boolean, category: String): [Service!]!
    service(id: ID!): Service
    transactions(bookingId: String, status: String, paymentMethod: String, userId: String): [Transaction!]!
    transaction(id: ID!): Transaction
    inventory(type: InventoryType): [Inventory!]!
    inventoryItem(id: ID!): Inventory
    users(email: String, walletAddress: String, role: String): [User!]!
    user(id: ID!, email: String, walletAddress: String): User
    workers(workerType: WorkerType): [Worker!]!
    worker(id: ID!, walletAddress: String): Worker
  }

  input CreateBookingInput {
    name: String!
    email: String!
    phone: String!
    service: String!
    date: String!
    time: String!
    address: String!
    numberOfGifts: Int!
    message: String
  }

  input UpdateBookingStatusInput {
    id: ID!
    status: BookingStatus!
  }

  input UpdateAvailabilityInput {
    availability: [DayAvailabilityInput!]
    dayOfWeekSchedules: [DayOfWeekScheduleInput!]
  }

  input DayAvailabilityInput {
    date: String!
    slots: [String!]!
    isAvailable: Boolean!
  }

  input DayOfWeekScheduleInput {
    dayOfWeek: Int!
    slots: [String!]!
    isBlocked: Boolean!
  }

  input CreatePricingInput {
    name: String!
    description: String
    price: Float!
    priceType: String!
    features: [String!]
    group: String
    serviceCategory: String
    active: Boolean
    order: Int
  }

  input UpdatePricingInput {
    id: ID!
    name: String
    description: String
    price: Float
    priceType: String
    features: [String!]
    group: String
    serviceCategory: String
    active: Boolean
    order: Int
  }

  input ReorderPricingInput {
    pricing: [PricingOrderInput!]!
  }

  input PricingOrderInput {
    id: ID!
    order: Int!
  }

  input CreateServiceInput {
    title: String!
    subtitle: String
    description: String
    tag: String
    category: String
    active: Boolean
    order: Int
  }

  input UpdateServiceInput {
    id: ID!
    title: String
    subtitle: String
    description: String
    tag: String
    category: String
    active: Boolean
    order: Int
  }

  input ReorderServicesInput {
    services: [ServiceOrderInput!]!
  }

  input ServiceOrderInput {
    id: ID!
    order: Int!
  }

  input CreateTransactionInput {
    bookingId: String!
    userId: String
    amount: Float!
    currency: String!
    status: String!
    paymentMethod: String!
    paymentIntentId: String
    metadata: String
  }

  input CreateUserInput {
    email: String
    walletAddress: String
    name: String
    role: String!
  }

  input UpdateUserInput {
    id: ID!
    email: String
    walletAddress: String
    name: String
    role: String
  }

  input CreateWorkerInput {
    walletAddress: String!
    name: String
    email: String
    phone: String
    availabilityId: String
  }

  input UpdateWorkerInput {
    id: ID!
    name: String
    email: String
    phone: String
    packagesCheckedIn: [String!]
    packagesWrapped: [String!]
    packagesCompleted: [String!]
    packagesDroppedOff: [String!]
    availabilityId: String
  }

  input AddWorkerPackageInput {
    id: ID!
    bookingId: String!
    action: WorkerPackageAction!
  }

  enum WorkerPackageAction {
    check_in
    wrap
    complete
    drop_off
  }

  input CreateInventoryInput {
    name: String!
    type: InventoryType!
    size: String
    cost: Float!
    quantity: Int!
    unit: String
    supplier: String
    thumbnail: String
    amazonAsin: String
    amazonUrl: String
    notes: String
  }

  input UpdateInventoryInput {
    id: ID!
    name: String
    type: InventoryType
    size: String
    cost: Float
    quantity: Int
    unit: String
    supplier: String
    thumbnail: String
    amazonAsin: String
    amazonUrl: String
    notes: String
  }

  type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    updateBookingStatus(input: UpdateBookingStatusInput!): Booking!
    updateAvailability(input: UpdateAvailabilityInput!): Availability!
    createPricing(input: CreatePricingInput!): Pricing!
    updatePricing(input: UpdatePricingInput!): Pricing!
    deletePricing(id: ID!): Boolean!
    reorderPricing(input: ReorderPricingInput!): Boolean!
    createService(input: CreateServiceInput!): Service!
    updateService(input: UpdateServiceInput!): Service!
    deleteService(id: ID!): Boolean!
    reorderServices(input: ReorderServicesInput!): Boolean!
    createTransaction(input: CreateTransactionInput!): Transaction!
    createInventory(input: CreateInventoryInput!): Inventory!
    updateInventory(input: UpdateInventoryInput!): Inventory!
    deleteInventory(id: ID!): Boolean!
    createUser(input: CreateUserInput!): User!
    updateUser(input: UpdateUserInput!): User!
    createWorker(input: CreateWorkerInput!): Worker!
    updateWorker(input: UpdateWorkerInput!): Worker!
    addWorkerPackage(input: AddWorkerPackageInput!): Worker!
  }
`

