// API Route: /api/elves
// Get all elves or select an elf for a kid

const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper to verify token
function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    try {
        const token = authHeader.split(' ')[1];
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET - Get all elves
        if (req.method === 'GET') {
            const { data: elves, error } = await supabase
                .from('elves')
                .select('*')
                .eq('is_active', true)
                .order('id');
            
            if (error) throw error;
            
            return res.status(200).json(elves);
        }
        
        // POST - Select an elf for the kid
        if (req.method === 'POST') {
            const user = verifyToken(req);
            if (!user || user.type !== 'kid') {
                return res.status(401).json({ error: 'Please log in first!' });
            }
            
            const { elfId } = req.body;
            
            // Update kid's selected elf
            const { error } = await supabase
                .from('kids')
                .update({ elf_id: elfId })
                .eq('id', user.id);
            
            if (error) throw error;
            
            // Get the elf details
            const { data: elf } = await supabase
                .from('elves')
                .select('*')
                .eq('id', elfId)
                .single();
            
            return res.status(200).json({ 
                message: `You're now friends with ${elf.name}! 🧝`,
                elf 
            });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Elves error:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};
