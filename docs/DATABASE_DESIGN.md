# Database Design — ReviewQR

Primary engine: Supabase PostgreSQL. Schemas below are assumed after `supabase db push`.

## Tables

### organizations
| col | type | notes |
|---|---|---|
| id uuid pk | | org owner |
| name text not null | e.g., Royal Palace Hotel | business entity |
| slug text unique | url-safe | |
| category text | Restaurant & Lounge / Hotel & Lodging … | |
| city text | | |
| phone text | optional | |
| email text unique | manager contact | |
| address text | | |
| accent_color text | hex | default `#1a73e8` |
| created_at timestamptz default now() | | |

### users
| col | type | |
|---|---|---|
| id uuid pk | | |
| org_id uuid fk→organizations.id | | one user per org (operator) |
| email text unique | | |
| display_name text | | |
| password_hash text | | never store plaintext |
| role text | operator/admin | |

### qr_codes
| col | type | |
|---|---|---|
| id uuid pk | | |
| org_id fk | | |
| slug text unique | | `slug = org_slug + '-' + nanoid(8)` |
| business_name text | denormalized cache | |
| destination_url text | g.page/r/… shortlink | |
| destination_place_id text | | |
| placement_type text | A5 Acrylic Stand / A6 Mini Table Tent / Counter Sticker … |
| accent_color text | |
| headline text | "Review us on Google" |
| tagline text | |
| current_template text | template preset key |
| status text | draft / active / archived |
| created_at timestamptz | |
| updated_at timestamptz | |

### qr_analytics
| col | type | |
|---|---|---|
| id bigserial pk | | |
| qr_code_id uuid fk | | |
| event text enum | scan / unique_visitor / google_click | only observable events |
| occurred_at timestamptz default now() | |

Indexes: `qr_analytics(qr_code_id, occurred_at)`, `qr_analytics(event)`.

### reviews (record-only, not fabricated)
Store the *intent* metadata captured during the customer flow so owners can request follow-ups later — NOT the submitted content. Always marked `status=submitted_external`.
| col | type | |
|---|---|---|
| id uuid pk | | |
| qr_code_id fk | | |
| star int | 1..5 | |
| suggestion_category text | Hospitality & Staff / Food & Ambience / Overall Impression | |
| review_draft text | short pre-filled phrase from provider | |
| email_present bool | whether customer left identity card | |
| status text | requested / replied / completed | |
| created_at timestamptz | |

### refresh_tokens (session persistence fallback)
| col | type | |
|---|---|---|
| id uuid pk | |
| user_id fk | |
| expires_at timestamptz | |
| revoked bool | |

## Row Level Security
```sql
alter table organizations enable row level security;
alter table users  enable row level security;
alter table qr_codes  enable row level security;
alter table qr_analytics enable row level security;
alter table reviews   enable row level security;

create policy "select org rows" on qr_codes for select using (org_id = current_setting('app.org_id')::uuid);
create policy "insert org rows" on qr_codes for insert with check (org_id = current_setting('app.org_id')::uuid);
create policy "update org rows" on qr_codes for update using (org_id = current_setting('app.org_id')::uuid);
create policy "delete org rows"  on qr_codes for delete using (org_id = current_setting('app.org_id')::uuid);
-- similar for others, keyed on owner_id lookup via joined user row
```
Every mutation sets `SET LOCAL app.org_id = <row>` then queries. Cross-org leakage prevented.
