// API Route: /api/parent
// Parent-specific functions: get kids, update settings, respond to letters

const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const user = verifyToken(req);
    if (!user || user.type !== 'parent') {
        return res.status(401).json({ error: 'Parent login required' });
    }

    const { action } = req.query;

    try {
        switch (action) {
            // Get parent's kids
            case 'kids': {
                if (req.method !== 'GET') {
                    return res.status(405).json({ error: 'Method not allowed' });
                }
                
                const { data: kids, error } = await supabase
                    .from('kids')
                    .select('id, username, name, age, elf_id, created_at')
                    .eq('parent_id', user.id)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                return res.status(200).json(kids);
            }
            
            // Create a new kid account
            case 'create-kid': {
                if (req.method !== 'POST') {
                    return res.status(405).json({ error: 'Method not allowed' });
                }
                
                const { username, password, name, age } = req.body;
                
                // Check if username exists
                const { data: existing } = await supabase
                    .from('kids')
                    .select('id')
                    .eq('username', username)
                    .single();
                
                if (existing) {
                    return res.status(400).json({ error: 'Username already taken' });
                }
                
                const hashedPassword = await bcrypt.hash(password, 10);
                
                const { data: kid, error } = await supabase
                    .from('kids')
                    .insert([{
                        parent_id: user.id,
                        username,
                        password: hashedPassword,
                        name,
                        age: parseInt(age)
                    }])
                    .select()
                    .single();
                
                if (error) throw error;
                
                return res.status(200).json({
                    message: `Account created for ${name}!`,
                    kid: { id: kid.id, username: kid.username, name: kid.name, age: kid.age }
                });
            }
            
            // Update response mode
            case 'settings': {
                if (req.method !== 'PUT') {
                    return res.status(405).json({ error: 'Method not allowed' });
                }
                
                const { responseMode } = req.body;
                
                const { error } = await supabase
                    .from('parents')
                    .update({ response_mode: responseMode })
                    .eq('id', user.id);
                
                if (error) throw error;
                
                return res.status(200).json({ 
                    message: `Response mode set to ${responseMode === 'ai' ? 'AI (automatic)' : 'Parent (manual)'}`
                });
            }
            
            // Respond to a letter manually
            case 'respond': {
                if (req.method !== 'POST') {
                    return res.status(405).json({ error: 'Method not allowed' });
                }
                
                const { letterId, response } = req.body;
                
                // Verify this letter belongs to parent's kid
                const { data: letter } = await supabase
                    .from('letters')
                    .select('kid_id, kids!inner(parent_id)')
                    .eq('id', letterId)
                    .single();
                
                if (!letter || letter.kids.parent_id !== user.id) {
                    return res.status(403).json({ error: 'Cannot access this letter' });
                }
                
                const { error } = await supabase
                    .from('letters')
                    .update({
                        response,
                        response_at: new Date().toISOString(),
                        responded_by: 'parent'
                    })
                    .eq('id', letterId);
                
                if (error) throw error;
                
                return res.status(200).json({ message: 'Response sent as elf! 🧝' });
            }
            
            // Get parent code
            case 'code': {
                if (req.method !== 'GET') {
                    return res.status(405).json({ error: 'Method not allowed' });
                }
                
                const { data: parent, error } = await supabase
                    .from('parents')
                    .select('parent_code')
                    .eq('id', user.id)
                    .single();
                
                if (error) throw error;
                
                return res.status(200).json({ parentCode: parent.parent_code });
            }
            
            default:
                return res.status(400).json({ error: 'Invalid action. Use ?action=kids|create-kid|settings|respond|code' });
        }
        
    } catch (error) {
        console.error('Parent API error:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};
