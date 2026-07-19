import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  atsType: varchar("ats_type", { length: 30 }).notNull(),
  config: jsonb("config").notNull().$type<Record<string, unknown>>(),
  active: boolean("active").notNull().default(true),
  careersUrl: text("careers_url"),
});

export const jobPostings = pgTable(
  "job_postings",
  {
    id: serial("id").primaryKey(),
    companyId: integer("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    externalId: varchar("external_id", { length: 200 }).notNull(),
    title: text("title").notNull(),
    location: text("location"),
    url: text("url").notNull(),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    employmentType: varchar("employment_type", { length: 100 }),
    raw: jsonb("raw").$type<Record<string, unknown>>(),
    matchedKeywords: text("matched_keywords").array(),
    isMatch: boolean("is_match").notNull().default(false),
    isTargetCity: boolean("is_target_city").notNull().default(false),
  },
  (t) => [uniqueIndex("company_external_id_idx").on(t.companyId, t.externalId)]
);

export const applicationStatus = pgTable("application_status", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .notNull()
    .references(() => jobPostings.id, { onDelete: "cascade" })
    .unique(),
  status: varchar("status", { length: 30 }).notNull().default("a_voir"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull().unique(),
  keys: jsonb("keys").notNull().$type<{ p256dh: string; auth: string }>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const scrapeRuns = pgTable("scrape_runs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, {
    onDelete: "cascade",
  }),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: varchar("status", { length: 20 }).notNull(),
  jobsFound: integer("jobs_found").default(0),
  newJobs: integer("new_jobs").default(0),
  errorMessage: text("error_message"),
});
