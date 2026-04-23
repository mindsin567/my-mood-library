import { useState, useEffect } from 'react';
import { Camera, Trash2, Save, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const Profile = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profile, setProfile] = useState({
        display_name: '',
        avatar_url: null,
        bio: '',
        date_of_birth: '',
        phone_number: '',
        location: '',
    });
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user)
                return;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();
            if (error) {
                toast({ title: 'Error', description: 'Failed to load profile.', variant: 'destructive' });
            }
            else if (data) {
                setProfile({
                    display_name: data.display_name || '',
                    avatar_url: data.avatar_url,
                    bio: data.bio || '',
                    date_of_birth: data.date_of_birth || '',
                    phone_number: data.phone_number || '',
                    location: data.location || '',
                });
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user]);
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !user)
            return;
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;
            // Delete old avatar if exists
            if (profile.avatar_url) {
                const oldPath = profile.avatar_url.split('/avatars/')[1];
                if (oldPath) {
                    await supabase.storage.from('avatars').remove([oldPath]);
                }
            }
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });
            if (uploadError)
                throw uploadError;
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setProfile(prev => ({ ...prev, avatar_url: urlData.publicUrl + '?t=' + Date.now() }));
            toast({ title: 'Success', description: 'Avatar uploaded!' });
        }
        catch {
            toast({ title: 'Error', description: 'Failed to upload avatar.', variant: 'destructive' });
        }
        finally {
            setUploading(false);
        }
    };
    const handleRemoveAvatar = async () => {
        if (!profile.avatar_url || !user)
            return;
        try {
            const path = profile.avatar_url.split('/avatars/')[1]?.split('?')[0];
            if (path) {
                await supabase.storage.from('avatars').remove([path]);
            }
            setProfile(prev => ({ ...prev, avatar_url: null }));
            toast({ title: 'Success', description: 'Avatar removed!' });
        }
        catch {
            toast({ title: 'Error', description: 'Failed to remove avatar.', variant: 'destructive' });
        }
    };
    const handleSave = async () => {
        if (!user)
            return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                display_name: profile.display_name || null,
                avatar_url: profile.avatar_url,
                bio: profile.bio || null,
                date_of_birth: profile.date_of_birth || null,
                phone_number: profile.phone_number || null,
                location: profile.location || null,
            })
                .eq('user_id', user.id);
            if (error)
                throw error;
            toast({ title: 'Success', description: 'Profile updated!' });
        }
        catch {
            toast({ title: 'Error', description: 'Failed to save profile.', variant: 'destructive' });
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (<DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>);
    }
    return (<DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your <span className="text-gradient-primary">Profile</span>
          </h1>
          <p className="text-muted-foreground">Update your personal information.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar_url || undefined}/>
                  <AvatarFallback className="bg-primary/10">
                    <User className="w-10 h-10 text-primary"/>
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4 text-primary-foreground"/>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading}/>
                </label>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Profile Photo</p>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB.</p>
                {profile.avatar_url && (<Button variant="outline" size="sm" onClick={handleRemoveAvatar} className="gap-1">
                    <Trash2 className="w-3 h-3"/>
                    Remove
                  </Button>)}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={profile.display_name || ''} onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))} placeholder="Your name"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ''} disabled className="bg-muted"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={profile.phone_number || ''} onChange={(e) => setProfile(prev => ({ ...prev, phone_number: e.target.value }))} placeholder="+1 234 567 8900"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={profile.date_of_birth || ''} onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}/>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={profile.location || ''} onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))} placeholder="City, Country"/>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={profile.bio || ''} onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell us about yourself..." className="min-h-[100px]"/>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              <Save className="w-4 h-4"/>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>);
};
export default Profile;
