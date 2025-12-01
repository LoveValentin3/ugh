// API Route: /api/auth
// Handles parent and kid login/register

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, ...data } = req.body;

    try {
        switch (action) {
            case 'parent-register': {
                const { email, password, name } = data;
                
                // Check if email exists
                const { data: existing } = await supabase
                    .from('parents')
                    .select('id')
                    .eq('email', email)
                    .single();
                
                if (existing) {
                    return res.status(400).json({ error: 'Email already registered' });
                }
                
                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
                
                // Generate parent code
                const parentCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                
                // Insert parent
                const { data: parent, error } = await supabase
                    .from('parents')
                    .insert([{ 
                        email, 
                        password: hashedPassword, 
                        name, 
                        parent_code: parentCode 
                    }])
                    .select()
                    .single();
                
                if (error) throw error;
                
                const token = jwt.sign({ id: parent.id, type: 'parent' }, JWT_SECRET, { expiresIn: '7d' });
                
                return res.status(200).json({ 
                    token, 
                    user: { id: parent.id, email: parent.email, name: parent.name, parent_code: parent.parent_code }
                });
            }
            
            case 'parent-login': {
                const { email, password } = data;
                
                const { data: parent } = await supabase
                    .from('parents')
                    .select('*')
                    .eq('email', email)
                    .single();
                
                if (!parent) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }
                
                const validPassword = await bcrypt.compare(password, parent.password);
                if (!validPassword) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }
                
                const token = jwt.sign({ id: parent.id, type: 'parent' }, JWT_SECRET, { expiresIn: '7d' });
                
                return res.status(200).json({ 
                    token, 
                    user: { 
                        id: parent.id, 
                        email: parent.email, 
                        name: parent.name, 
                        parent_code: parent.parent_code,
                        subscription_status: parent.subscription_status,
                        response_mode: parent.response_mode
                    }
                });
            }
            
            case 'kid-register': {
                const { username, password, name, age, parentCode } = data;
                
                // Verify parent code
                const { data: parent } = await supabase
                    .from('parents')
                    .select('id')
                    .eq('parent_code', parentCode)
                    .single();
                
                if (!parent) {
                    return res.status(400).json({ error: 'Invalid parent code. Ask your parent for the correct code!' });
                }
                
                // Check if username exists
                const { data: existing } = await supabase
                    .from('kids')
                    .select('id')
                    .eq('username', username)
                    .single();
                
                if (existing) {
                    return res.status(400).json({ error: 'That username is taken. Try another one!' });
                }
                
                const hashedPassword = await bcrypt.hash(password, 10);
                
                const { data: kid, error } = await supabase
                    .from('kids')
                    .insert([{ 
                        parent_id: parent.id,
                        username, 
                        password: hashedPassword, 
                        name, 
                        age: parseInt(age)
                    }])
                    .select()
                    .single();
                
                if (error) throw error;
                
                const token = jwt.sign({ id: kid.id, type: 'kid' }, JWT_SECRET, { expiresIn: '7d' });
                
                return res.status(200).json({ 
                    token, 
                    user: { id: kid.id, username: kid.username, name: kid.name, age: kid.age }
                });
            }
            
            case 'kid-login': {
                const { username, password } = data;
                
                const { data: kid } = await supabase
                    .from('kids')
                    .select('*')
                    .eq('username', username)
                    .single();
                
                if (!kid) {
                    return res.status(401).json({ error: 'Wrong username or password. Try again!' });
                }
                
                const validPassword = await bcrypt.compare(password, kid.password);
                if (!validPassword) {
                    return res.status(401).json({ error: 'Wrong username or password. Try again!' });
                }
                
                const token = jwt.sign({ id: kid.id, type: 'kid' }, JWT_SECRET, { expiresIn: '7d' });
                
                return res.status(200).json({ 
                    token, 
                    user: { id: kid.id, username: kid.username, name: kid.name, age: kid.age, elf_id: kid.elf_id }
                });
            }
            
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
};
