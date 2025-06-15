import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  IconButton,
  Badge,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit,
  PhotoCamera,
  Save,
  Security,
  History,
  Settings,
} from '@mui/icons-material';

// Use styled components for layout instead of Grid
const ProfileLayout = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(4),
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: '1fr 2fr',
  },
}));

const FormLayout = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
}));

const FullWidthField = styled('div')({
  gridColumn: '1 / -1',
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    institution: 'University of Technology',
    role: 'Student',
    bio: 'AI and Machine Learning enthusiast',
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Firebase update profile logic will be implemented here
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Firebase storage image upload logic will be implemented here
    console.log(event.target.files);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
        py: 8,
      }}
      className="page-transition"
    >
      <Container maxWidth="lg">
        <ProfileLayout>
          {/* Left Column - Profile Overview */}
          <Card
            className="scale-in"
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton
                    component="label"
                    sx={{
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  >
                    <PhotoCamera sx={{ color: 'white', fontSize: 20 }} />
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleImageUpload}
                    />
                  </IconButton>
                }
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    border: '4px solid white',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                  }}
                  alt={`${profileData.firstName} ${profileData.lastName}`}
                  src="/path-to-profile-image.jpg"
                />
              </Badge>

              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {`${profileData.firstName} ${profileData.lastName}`}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {profileData.role} at {profileData.institution}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                }}
              >
                {profileData.bio}
              </Typography>

              <Button
                variant="contained"
                startIcon={isEditing ? <Save /> : <Edit />}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="hover-button"
                disabled={loading}
                sx={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isEditing ? (
                  'Save Changes'
                ) : (
                  'Edit Profile'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Right Column - Profile Details */}
          <Card
            className="scale-in"
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab
                  icon={<Settings sx={{ fontSize: 20 }} />}
                  label="General"
                  iconPosition="start"
                />
                <Tab
                  icon={<Security sx={{ fontSize: 20 }} />}
                  label="Security"
                  iconPosition="start"
                />
                <Tab
                  icon={<History sx={{ fontSize: 20 }} />}
                  label="Activity"
                  iconPosition="start"
                />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <FormLayout>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, firstName: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, lastName: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                  <FullWidthField>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </FullWidthField>
                  <FullWidthField>
                    <TextField
                      fullWidth
                      label="Institution"
                      value={profileData.institution}
                      onChange={(e) =>
                        setProfileData({ ...profileData, institution: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </FullWidthField>
                  <FullWidthField>
                    <TextField
                      fullWidth
                      label="Role"
                      value={profileData.role}
                      onChange={(e) =>
                        setProfileData({ ...profileData, role: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </FullWidthField>
                  <FullWidthField>
                    <TextField
                      fullWidth
                      label="Bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      disabled={!isEditing}
                      multiline
                      rows={4}
                    />
                  </FullWidthField>
                </FormLayout>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Security Settings
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                  >
                    Change Password
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                  >
                    Enable Two-Factor Authentication
                  </Button>
                </Stack>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Recent Activity
                </Typography>
                <Typography color="text.secondary">
                  No recent activity to display
                </Typography>
              </TabPanel>
            </CardContent>
          </Card>
        </ProfileLayout>
      </Container>
    </Box>
  );
};

export default Profile;
