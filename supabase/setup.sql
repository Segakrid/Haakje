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
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Automatically create a profile row when a new user signs up.
-- The "name" comes from the metadata passed in supabase.auth.signUp({ options: { data: { name } } }).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Policies for fishing_rods
DROP POLICY IF EXISTS "Users can view their own fishing rods" ON fishing_rods;
CREATE POLICY "Users can view their own fishing rods" ON fishing_rods
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own fishing rods" ON fishing_rods;
CREATE POLICY "Users can insert their own fishing rods" ON fishing_rods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own fishing rods" ON fishing_rods;
CREATE POLICY "Users can update their own fishing rods" ON fishing_rods
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own fishing rods" ON fishing_rods;
CREATE POLICY "Users can delete their own fishing rods" ON fishing_rods
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for catches
DROP POLICY IF EXISTS "Users can view their own catches" ON catches;
CREATE POLICY "Users can view their own catches" ON catches
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own catches" ON catches;
CREATE POLICY "Users can insert their own catches" ON catches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own catches" ON catches;
CREATE POLICY "Users can update their own catches" ON catches
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own catches" ON catches;
CREATE POLICY "Users can delete their own catches" ON catches
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for fish_species and bait_types (public read)
ALTER TABLE fish_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE bait_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view fish species" ON fish_species;
CREATE POLICY "Anyone can view fish species" ON fish_species
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view bait types" ON bait_types;
CREATE POLICY "Anyone can view bait types" ON bait_types
  FOR SELECT USING (true);

-- Storage for catch images
-- Create a public bucket so getPublicUrl() works for displaying images.
INSERT INTO storage.buckets (id, name, public)
VALUES ('catch_images', 'catch_images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read images (bucket is public).
DROP POLICY IF EXISTS "Public can read catch images" ON storage.objects;
CREATE POLICY "Public can read catch images" ON storage.objects
  FOR SELECT USING (bucket_id = 'catch_images');

-- Only authenticated users can upload to the catch_images bucket.
DROP POLICY IF EXISTS "Authenticated users can upload catch images" ON storage.objects;
CREATE POLICY "Authenticated users can upload catch images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'catch_images');

-- Authenticated users can update objects in the catch_images bucket.
DROP POLICY IF EXISTS "Authenticated users can update catch images" ON storage.objects;
CREATE POLICY "Authenticated users can update catch images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'catch_images');

-- Authenticated users can delete objects in the catch_images bucket.
DROP POLICY IF EXISTS "Authenticated users can delete catch images" ON storage.objects;
CREATE POLICY "Authenticated users can delete catch images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'catch_images');
