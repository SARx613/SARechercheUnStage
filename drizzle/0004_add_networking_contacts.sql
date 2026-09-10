CREATE TABLE "networking_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"firm_name" text NOT NULL,
	"division" text,
	"city" varchar(20) DEFAULT 'other' NOT NULL,
	"contact_name" text,
	"title" text,
	"linkedin_url" text,
	"email" text,
	"channel" varchar(20) DEFAULT 'linkedin_inmail' NOT NULL,
	"status" varchar(30) DEFAULT 'a_faire' NOT NULL,
	"date_sent" timestamp with time zone,
	"follow_up_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
