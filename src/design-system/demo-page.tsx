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