-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extended from auth.users)
-- Note: We'll use the built-in auth.users table and create a profiles table

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fish Species table (predefined)
CREATE TABLE IF NOT EXISTS fish_species (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  scientific_name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bait Types table (predefined)
CREATE TABLE IF NOT EXISTS bait_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fishing Rods table
CREATE TABLE IF NOT EXISTS fishing_rods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  length NUMERIC(10,2),
  weight NUMERIC(10,2),
  material TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catches table
CREATE TABLE IF NOT EXISTS catches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fish_species_id UUID REFERENCES fish_species(id) ON DELETE SET NULL,
  bait_type_id UUID REFERENCES bait_types(id) ON DELETE SET NULL,
  fishing_rod_id UUID REFERENCES fishing_rods(id) ON DELETE SET NULL,
  weight_kg NUMERIC(10,2),
  length_cm NUMERIC(10,2),
  location TEXT NOT NULL,
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  notes TEXT,
  images TEXT[],
  caught_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default fish species
-- Gebruik ON CONFLICT (name) DO NOTHING om dubbelen te voorkomen
INSERT INTO fish_species (name, scientific_name, description) VALUES
('Snoekbaars', 'Sander lucioperca', 'Roofdier, leeft in zoet water'),
('Baars', 'Perca fluviatilis', 'Veelvoorkomende roofvis in Nederland'),
('Snoek', 'Esox lucius', 'Grote roofvis, populair bij sportvissers'),
('Karp', 'Cyprinus carpio', 'Vredelievende vis, vaak in vijvers'),
('Brasem', 'Abramis brama', 'Vredelievende vis, leeft in scholen'),
('Voorn', 'Rutilus rutilus', 'Veelvoorkomende vis in Nederlandse wateren'),
('Blankvoorn', 'Blicca bjoerkna', 'Zilveren vis, verwant aan de brasem'),
('Smeelt', 'Osmerus eperlanus', 'Kleine zeevis, ook in zoet water'),
('Paling', 'Anguilla anguilla', 'Lange, slangachtige vis'),
('Forel', 'Salmo trutta', 'Zalmachtige, leeft in koud water'),
('Regenboogforel', 'Oncorhynchus mykiss', 'Populaire sportvis'),
('Kabeljauw', 'Gadus morhua', 'Zoutwatervis, ook gevangen vanaf de kust'),
('Makreel', 'Scomber scombrus', 'Snelle zwemmer, populair om te eten'),
('Haring', 'Clupea harengus', 'Zoutwatervis, vaak in scholen'),
('Zeebaars', 'Dicentrarchus labrax', 'Roofdier in zee en brak water'),
('Tong', 'Solea solea', 'Platte vis, leeft op de bodem')
ON CONFLICT (name) DO NOTHING;

-- Insert some default bait types
INSERT INTO bait_types (name, description) VALUES
('Worm', 'Natuurlijk aas, werkt voor veel vissoorten'),
('Maden', 'Kleine witte larven, populair aas'),
('Kunststof', 'Kunststof lokaas in verschillende kleuren en vormen'),
('Levend aas', 'Kleine visjes als levend aas'),
('Dood aas', 'Dode vis als aas'),
('Vlieg', 'Gebruikt voor vliegvissen'),
('Kunstvlieg', 'Kunstmatige vlieg voor vliegvissen'),
('Baitball', 'Bal van aas voor karpervissen'),
('Boilie', 'Gekookte aasbal voor karpervissen'),
('Mais', 'Maïskorrels als aas'),
('Deeg', 'Deeg als aas voor karpers'),
('Kunststof worm', 'Kunststof imitatie van een worm'),
('Spinner', 'Draaiend lokaas met blad'),
('Lepel', 'Metaal lokaas dat als een vis beweegt'),
('Jig', 'Lood met haak voor diepvissen')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_catches_user_id ON catches(user_id);
CREATE INDEX IF NOT EXISTS idx_catches_fish_species_id ON catches(fish_species_id);
CREATE INDEX IF NOT EXISTS idx_catches_bait_type_id ON catches(bait_type_id);
CREATE INDEX IF NOT EXISTS idx_catches_fishing_rod_id ON catches(fishing_rod_id);
CREATE INDEX IF NOT EXISTS idx_catches_caught_at ON catches(caught_at);
CREATE INDEX IF NOT EXISTS idx_fishing_rods_user_id ON fishing_rods(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fishing_rods ENABLE ROW LEVEL SECURITY;
ALTER TABLE catches ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for fishing_rods
CREATE POLICY "Users can view their own fishing rods" ON fishing_rods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fishing rods" ON fishing_rods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fishing rods" ON fishing_rods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fishing rods" ON fishing_rods
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for catches
CREATE POLICY "Users can view their own catches" ON catches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own catches" ON catches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catches" ON catches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catches" ON catches
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for fish_species and bait_types (public read)
ALTER TABLE fish_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE bait_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fish species" ON fish_species
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view bait types" ON bait_types
  FOR SELECT USING (true);

-- Storage for images
-- Create a bucket for catch images (this is done in the Supabase dashboard)
-- Bucket name: catch_images
-- Enable public access for the bucket
