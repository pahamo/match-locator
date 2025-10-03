import React from 'react';
import {
  Button,
  Input,
  Checkbox,
  Grid,
  Container,
  Stack,
  Flex,
  Heading,
  Text,
  Link,
  Select,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Avatar,
  AvatarGroup,
  Progress,
  CircularProgress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './components';
import { Label } from '../components/ui/label';

// Demo page to test all new components
const DesignSystemDemo: React.FC = () => {

  return (
    <div className="min-h-screen bg-background">
      <Container size="xl" padding>
        <Stack space="2xl">
          <div>
            <Heading level={1} size="3xl" responsive>
              Design System v2.0 Demo
            </Heading>
            <Text variant="subtitle" color="secondary">
              Interactive demonstration of all new components
            </Text>
          </div>

        {/* Button Variants */}
        <div>
          <Heading level={2}>Buttons</Heading>
          <Stack space="lg">
            <Flex gap="md" wrap="wrap">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
            </Flex>

            <Flex gap="md" wrap="wrap">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="default">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" size="lg">Extra Large</Button>
            </Flex>

            <Flex gap="md" wrap="wrap">
              <Button variant="secondary" disabled>Disabled</Button>
              <Button variant="primary" style={{ width: '100%' }}>Full Width</Button>
            </Flex>
          </Stack>
        </div>

        {/* Form Components */}
        <div>
          <Heading level={2}>Form Components</Heading>
          <Grid cols={1} mdCols={2} gap="lg">
            <Stack space="md">
              <Input
                placeholder="Enter your email"
              />

              <Input
                type="password"
                placeholder="Enter your password"
              />

              <Select
                label="Country"
                placeholder="Select your country"
                helperText="Choose your country of residence"
                options={[
                  { value: 'us', label: 'United States' },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'ca', label: 'Canada' },
                  { value: 'au', label: 'Australia' },
                  { value: 'de', label: 'Germany' },
                  { value: 'fr', label: 'France', disabled: true },
                ]}
              />

              <Select
                label="Priority Level"
                placeholder="Select priority"
                errorText="This field is required"
                variant="error"
                required
                options={[
                  { value: 'low', label: 'Low Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'high', label: 'High Priority' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />
            </Stack>

            <Stack space="md">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">I agree to the terms and conditions</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="newsletter" defaultChecked />
                <Label htmlFor="newsletter">Subscribe to newsletter</Label>
              </div>
            </Stack>
          </Grid>
        </div>

        {/* Typography */}
        <div>
          <Heading level={2}>Typography</Heading>
          <Stack space="md">
            <Heading level={1}>Heading Level 1</Heading>
            <Heading level={2}>Heading Level 2</Heading>
            <Heading level={3}>Heading Level 3</Heading>

            <Text variant="body">
              This is body text with normal weight and line height optimized for readability.
            </Text>

            <Text variant="caption" color="muted">
              This is caption text that's smaller and muted for secondary information.
            </Text>

            <div>
              <Link href="https://example.com" external>External Link</Link>
              {' | '}
              <Link href="/internal">Internal Link</Link>
              {' | '}
              <Link variant="danger" href="/danger">Danger Link</Link>
            </div>
          </Stack>
        </div>

        {/* Layout Components */}
        <div>
          <Heading level={2}>Layout Components</Heading>

          <Stack space="lg">
            <div>
              <Text weight="medium">Responsive Grid</Text>
              <Grid cols={1} smCols={2} mdCols={3} lgCols={4} gap="md">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="p-4 bg-muted rounded-lg text-center">
                    Item {i + 1}
                  </div>
                ))}
              </Grid>
            </div>

            <div>
              <Text weight="medium">Flex Layout</Text>
              <Flex justify="between" align="center" gap="md" className="p-4 bg-muted/50 rounded-lg">
                <Text>Left Content</Text>
                <Button variant="primary">Action</Button>
              </Flex>
            </div>
          </Stack>
        </div>

        {/* Dialog Demo */}
        <div>
          <Heading level={2}>Dialog</Heading>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="primary">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Demo Dialog</DialogTitle>
              </DialogHeader>
              <Stack space="md">
                <Text>
                  This is a demonstration of the dialog component with focus trapping,
                  keyboard navigation, and accessible markup.
                </Text>

                <Input
                  placeholder="Try tabbing through the dialog"
                />

                <Checkbox />
              </Stack>
              <Flex justify="end" gap="md">
                <Button variant="ghost">Cancel</Button>
                <Button variant="primary">Confirm</Button>
              </Flex>
            </DialogContent>
          </Dialog>
        </div>

        {/* Badges */}
        <div>
          <Heading level={2}>Badges</Heading>
          <Stack space="lg">
            <div>
              <Text weight="medium">Basic Badges</Text>
              <Flex gap="sm" wrap="wrap">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </Flex>
            </div>

            <div>
              <Text weight="medium">Status Badges</Text>
              <Flex gap="sm" wrap="wrap">
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="live">Live</Badge>
              </Flex>
            </div>

            <div>
              <Text weight="medium">Competition Badges</Text>
              <Flex gap="sm" wrap="wrap">
                <Badge variant="epl">Premier League</Badge>
                <Badge variant="ucl">Champions League</Badge>
              </Flex>
            </div>

            <div>
              <Text weight="medium">Sizes & Features</Text>
              <Flex gap="sm" wrap="wrap" align="center">
                <Badge size="sm">Small</Badge>
                <Badge size="default">Default</Badge>
                <Badge size="lg">Large</Badge>
                <Badge dot variant="success">With Dot</Badge>
                <Badge removable onRemove={() => alert('Badge removed!')}>
                  Removable
                </Badge>
              </Flex>
            </div>
          </Stack>
        </div>

        {/* Cards */}
        <div>
          <Heading level={2}>Cards</Heading>
          <Grid cols={1} mdCols={2} lgCols={3} gap="lg">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>
                  A simple card with default styling and responsive layout.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Text>This is the card content area where you can put any information.</Text>
              </CardContent>
              <CardFooter>
                <Button>Learn More</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated" hoverable>
              <CardHeader>
                <CardTitle>Elevated & Hoverable</CardTitle>
                <CardDescription>
                  This card has elevation and hover effects.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="success">Active</Badge>
              </CardContent>
            </Card>

            <Card variant="live">
              <CardHeader>
                <CardTitle>Live Card</CardTitle>
                <CardDescription>
                  Live content with pulsing animation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="live">LIVE</Badge>
              </CardContent>
            </Card>

            <Card loading />

            <Card variant="success" clickable>
              <CardHeader size="sm">
                <CardTitle size="sm">Success Card</CardTitle>
                <CardDescription>Clickable success variant.</CardDescription>
              </CardHeader>
            </Card>
          </Grid>
        </div>

        {/* Avatars */}
        <div>
          <Heading level={2}>Avatars</Heading>
          <Stack space="lg">
            <div>
              <Text weight="medium">Sizes & Shapes</Text>
              <Flex gap="md" align="center" wrap="wrap">
                <Avatar size="xs" fallback="XS" />
                <Avatar size="sm" fallback="SM" />
                <Avatar size="default" fallback="M" />
                <Avatar size="lg" fallback="LG" />
                <Avatar size="xl" fallback="XL" />
                <Avatar size="2xl" fallback="2XL" />
              </Flex>
            </div>

            <div>
              <Text weight="medium">Shapes</Text>
              <Flex gap="md" align="center" wrap="wrap">
                <Avatar shape="circle" fallback="C" />
                <Avatar shape="rounded" fallback="R" />
                <Avatar shape="square" fallback="S" />
              </Flex>
            </div>

            <div>
              <Text weight="medium">Status Indicators</Text>
              <Flex gap="md" align="center" wrap="wrap">
                <Avatar fallback="ON" status="online" />
                <Avatar fallback="OF" status="offline" />
                <Avatar fallback="AW" status="away" />
                <Avatar fallback="BY" status="busy" />
              </Flex>
            </div>

            <div>
              <Text weight="medium">Avatar Group</Text>
              <AvatarGroup
                max={3}
                avatars={[
                  { fallback: "JD" },
                  { fallback: "AS" },
                  { fallback: "MK" },
                  { fallback: "LP" },
                  { fallback: "RW" },
                ]}
              />
            </div>
          </Stack>
        </div>

        {/* Progress */}
        <div>
          <Heading level={2}>Progress</Heading>
          <Stack space="lg">
            <div>
              <Text weight="medium">Basic Progress</Text>
              <Stack space="md">
                <Progress value={25} showPercentage label="Basic Progress" />
                <Progress value={60} variant="success" showValue label="Success" />
                <Progress value={80} variant="warning" showPercentage />
                <Progress value={95} variant="error" size="lg" showPercentage />
              </Stack>
            </div>

            <div>
              <Text weight="medium">Indeterminate Progress</Text>
              <Progress indeterminate label="Loading..." />
            </div>

            <div>
              <Text weight="medium">Circular Progress</Text>
              <Flex gap="lg" align="center" wrap="wrap">
                <CircularProgress value={25} showPercentage />
                <CircularProgress value={60} variant="success" showPercentage size={80} />
                <CircularProgress value={80} variant="warning" showValue />
                <CircularProgress indeterminate variant="info" />
              </Flex>
            </div>
          </Stack>
        </div>

        {/* Tabs */}
        <div>
          <Heading level={2}>Tabs</Heading>
          <Stack space="lg">
            <div>
              <Text weight="medium">Default Tabs</Text>
              <Tabs defaultValue="tab1">
                <TabsList>
                  <TabsTrigger value="tab1">Overview</TabsTrigger>
                  <TabsTrigger value="tab2" badge={3}>Comments</TabsTrigger>
                  <TabsTrigger value="tab3">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                  <Text>Overview content goes here.</Text>
                </TabsContent>
                <TabsContent value="tab2">
                  <Text>Comments content with 3 new comments.</Text>
                </TabsContent>
                <TabsContent value="tab3">
                  <Text>Settings content goes here.</Text>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Text weight="medium">Pills Variant</Text>
              <Tabs defaultValue="tab1">
                <TabsList variant="pills">
                  <TabsTrigger variant="pills" value="tab1">Design</TabsTrigger>
                  <TabsTrigger variant="pills" value="tab2">Development</TabsTrigger>
                  <TabsTrigger variant="pills" value="tab3">Testing</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                  <Card>
                    <CardContent>
                      <Text>Design phase content</Text>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab2">
                  <Card>
                    <CardContent>
                      <Text>Development phase content</Text>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab3">
                  <Card>
                    <CardContent>
                      <Text>Testing phase content</Text>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Text weight="medium">Underline Variant</Text>
              <Tabs defaultValue="tab1">
                <TabsList variant="underline">
                  <TabsTrigger variant="underline" value="tab1">Home</TabsTrigger>
                  <TabsTrigger variant="underline" value="tab2" badge={12}>Messages</TabsTrigger>
                  <TabsTrigger variant="underline" value="tab3">Profile</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                  <Text>Home content</Text>
                </TabsContent>
                <TabsContent value="tab2">
                  <Text>You have 12 new messages</Text>
                </TabsContent>
                <TabsContent value="tab3">
                  <Text>Profile settings and information</Text>
                </TabsContent>
              </Tabs>
            </div>
          </Stack>
        </div>

        {/* Dark Mode Toggle */}
        <div>
          <Heading level={2}>Dark Mode</Heading>
          <Button
            variant="secondary"
            onClick={() => document.documentElement.classList.toggle('dark')}
          >
            Toggle Dark Mode
          </Button>
        </div>
      </Stack>
    </Container>
    </div>
  );
};

export default DesignSystemDemo;