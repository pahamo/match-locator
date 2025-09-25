import React from 'react';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Grid,
  Container,
  Stack,
  Flex,
  Heading,
  Text,
  Link,
  Modal
} from './components';

// Demo page to test all new components
const DesignSystemDemo: React.FC = () => {
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
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
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
              <Button variant="primary" size="xl">Extra Large</Button>
            </Flex>

            <Flex gap="md" wrap="wrap">
              <Button variant="primary" loading>Loading</Button>
              <Button variant="secondary" disabled>Disabled</Button>
              <Button variant="primary" fullWidth>Full Width</Button>
            </Flex>
          </Stack>
        </div>

        {/* Form Components */}
        <div>
          <Heading level={2}>Form Components</Heading>
          <Grid cols={1} mdCols={2} gap="lg">
            <Stack space="md">
              <Input
                label="Email Address"
                placeholder="Enter your email"
                helperText="We'll never share your email"
              />

              <Input
                label="Password"
                type="password"
                variant="error"
                errorText="Password is required"
              />

              <Select
                label="Country"
                placeholder="Select your country"
                options={[
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'us', label: 'United States' },
                  { value: 'ca', label: 'Canada' }
                ]}
              />
            </Stack>

            <Stack space="md">
              <Checkbox
                label="I agree to the terms and conditions"
                helperText="Please read our privacy policy"
              />

              <Checkbox
                label="Subscribe to newsletter"
                checked
              />

              <Checkbox
                label="Marketing emails"
                variant="error"
                errorText="This field is required"
              />
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
                  <div key={i} style={{
                    padding: '1rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    Item {i + 1}
                  </div>
                ))}
              </Grid>
            </div>

            <div>
              <Text weight="medium">Flex Layout</Text>
              <Flex justify="between" align="center" gap="md" style={{
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }}>
                <Text>Left Content</Text>
                <Button variant="primary">Action</Button>
              </Flex>
            </div>
          </Stack>
        </div>

        {/* Modal Demo */}
        <div>
          <Heading level={2}>Modal</Heading>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Open Modal
          </Button>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Demo Modal"
            size="md"
            footer={
              <Flex justify="end" gap="md">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setModalOpen(false)}>
                  Confirm
                </Button>
              </Flex>
            }
          >
            <Stack space="md">
              <Text>
                This is a demonstration of the modal component with focus trapping,
                keyboard navigation, and accessible markup.
              </Text>

              <Input
                label="Test Input"
                placeholder="Try tabbing through the modal"
              />

              <Checkbox label="Test checkbox in modal" />
            </Stack>
          </Modal>
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
  );
};

export default DesignSystemDemo;