-- =====================================================
-- NORTH POLE PEN PALS - SUPABASE DATABASE SETUP
-- Just copy this ENTIRE file and paste it into Supabase SQL Editor
-- Then click "Run" - that's it!
-- =====================================================

-- PARENTS TABLE (stores parent accounts)
CREATE TABLE IF NOT EXISTS parents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    parent_code TEXT UNIQUE NOT NULL,
    response_mode TEXT DEFAULT 'ai' CHECK (response_mode IN ('ai', 'parent')),
    subscription_status TEXT DEFAULT 'inactive',
    subscription_plan TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KIDS TABLE (stores kid accounts, linked to parents)
CREATE TABLE IF NOT EXISTS kids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER CHECK (age >= 3 AND age <= 16),
    elf_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ELVES TABLE (the 20 elf characters)
CREATE TABLE IF NOT EXISTS elves (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('boy', 'girl')),
    emoji TEXT,
    job TEXT NOT NULL,
    personality TEXT NOT NULL,
    color_gradient TEXT,
    is_active BOOLEAN DEFAULT true
);

-- LETTERS TABLE (messages between kids and elves)
CREATE TABLE IF NOT EXISTS letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kid_id UUID REFERENCES kids(id) ON DELETE CASCADE,
    elf_id INTEGER REFERENCES elves(id),
    content TEXT NOT NULL,
    response TEXT,
    responded_by TEXT CHECK (responded_by IN ('ai', 'parent')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT false
);

-- VIDEOS TABLE (elf videos for kids)
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_emoji TEXT,
    video_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CERTIFICATES TABLE (friendship certificates, nice list, etc)
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kid_id UUID REFERENCES kids(id) ON DELETE CASCADE,
    certificate_type TEXT NOT NULL,
    title TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GAME SCORES TABLE (for mini games)
CREATE TABLE IF NOT EXISTS game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kid_id UUID REFERENCES kids(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL,
    score INTEGER NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSERT THE 20 ELVES (10 boys, 10 girls)
-- =====================================================

INSERT INTO elves (name, gender, emoji, job, personality, color_gradient) VALUES
-- Boy Elves
('Jingle', 'boy', '🧝‍♂️', 'Toy Workshop Expert', 'Energetic and loves building trains! Always humming Christmas songs.', 'from-red-700 to-red-900'),
('Frost', 'boy', '🧝‍♂️', 'Reindeer Trainer', 'Gentle and great with animals. Rudolph is his best friend!', 'from-blue-700 to-blue-900'),
('Tinker', 'boy', '🧝‍♂️', 'Gadget Inventor', 'Curious and loves science! Invented the automatic gift wrapper.', 'from-purple-700 to-purple-900'),
('Dash', 'boy', '🧝‍♂️', 'Sleigh Speed Tester', 'Fast and adventurous! Holds the North Pole speed record.', 'from-green-700 to-green-900'),
('Pepper', 'boy', '🧝‍♂️', 'Cookie Quality Tester', 'Funny and loves jokes! Has tasted over 10,000 cookies.', 'from-orange-700 to-orange-900'),
('Snowball', 'boy', '🧝‍♂️', 'Snow Globe Maker', 'Creative and artistic. Each globe tells a unique story.', 'from-cyan-700 to-cyan-900'),
('Nutmeg', 'boy', '🧝‍♂️', 'Hot Cocoa Specialist', 'Warm and caring. Makes the best hot chocolate ever!', 'from-amber-700 to-amber-900'),
('Boots', 'boy', '🧝‍♂️', 'Letter Sorter', 'Organized and helpful. Reads every letter to Santa!', 'from-stone-700 to-stone-900'),
('Blitzen Jr', 'boy', '🧝‍♂️', 'North Pole Guide', 'Brave and protective. Gives the best North Pole tours!', 'from-red-800 to-red-950'),
('Chip', 'boy', '🧝‍♂️', 'Computer Elf', 'Smart and tech-savvy. Runs the Nice List database!', 'from-slate-700 to-slate-900'),
-- Girl Elves
('Sparkle', 'girl', '🧝‍♀️', 'Cookie Baker', 'Sweet and loves baking treats! Her gingerbread is famous.', 'from-pink-600 to-pink-800'),
('Holly', 'girl', '🧝‍♀️', 'Gift Wrapper Expert', 'Creative with beautiful bows! No gift is too tricky for her.', 'from-rose-600 to-rose-800'),
('Twinkle', 'girl', '🧝‍♀️', 'Light Decorator', 'Bright and cheerful! Decorates the biggest Christmas tree.', 'from-yellow-600 to-yellow-800'),
('Snowflake', 'girl', '🧝‍♀️', 'Ice Sculptor', 'Elegant and patient. Creates magical ice castles.', 'from-sky-600 to-sky-800'),
('Candy', 'girl', '🧝‍♀️', 'Candy Cane Maker', 'Sweet and energetic! Invented 47 candy cane flavors.', 'from-red-600 to-pink-800'),
('Ivy', 'girl', '🧝‍♀️', 'Garden Elf', 'Nature-loving and peaceful. Grows magical poinsettias.', 'from-emerald-600 to-emerald-800'),
('Mittens', 'girl', '🧝‍♀️', 'Clothing Designer', 'Fashionable and creative. Designs all elf uniforms!', 'from-violet-600 to-violet-800'),
('Cinnamon', 'girl', '🧝‍♀️', 'Scent Specialist', 'Warm and comforting. Makes the workshop smell amazing.', 'from-orange-600 to-orange-800'),
('Aurora', 'girl', '🧝‍♀️', 'Northern Lights Watcher', 'Dreamy and magical. Can predict when lights will appear.', 'from-indigo-600 to-purple-800'),
('Belle', 'girl', '🧝‍♀️', 'Bell Choir Leader', 'Musical and joyful! Conducts the famous Elf Orchestra.', 'from-amber-600 to-amber-800');

-- =====================================================
-- INSERT SAMPLE VIDEOS
-- =====================================================

INSERT INTO videos (title, description, thumbnail_emoji, video_url, is_premium) VALUES
('Welcome to the North Pole!', 'Take a magical tour of Santas village!', '🏠', 'https://example.com/welcome.mp4', false),
('Meet the Reindeer', 'Say hi to Rudolph and all his friends!', '🦌', 'https://example.com/reindeer.mp4', false),
('Inside the Toy Workshop', 'See how we make all the amazing toys!', '🧸', 'https://example.com/workshop.mp4', false),
('Elf Dance Party', 'Join our festive holiday dance!', '💃', 'https://example.com/dance.mp4', false),
('Cookie Baking Time', 'Learn our secret North Pole cookie recipes!', '🍪', 'https://example.com/cookies.mp4', true),
('Northern Lights Show', 'Watch the beautiful aurora over the North Pole!', '🌌', 'https://example.com/aurora.mp4', true);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (keeps data safe)
-- =====================================================

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- Allow the API to access all data (using service role key)
CREATE POLICY "Service role can do everything" ON parents FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON kids FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON letters FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON certificates FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON game_scores FOR ALL USING (true);

-- Public read access to elves and videos (they're not sensitive)
ALTER TABLE elves ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view elves" ON elves FOR SELECT USING (true);
CREATE POLICY "Anyone can view videos" ON videos FOR SELECT USING (true);

-- =====================================================
-- DONE! Your database is ready! 🎄
-- =====================================================
