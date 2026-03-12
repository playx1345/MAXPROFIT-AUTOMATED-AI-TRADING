/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import { Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps { siteName: string; confirmationUrl: string }

const LOGO = "https://kxjbankkuapchkezjjeq.supabase.co/storage/v1/object/public/email-assets/wtx-logo.png"

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Win-Tradex login link</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}><Img src={LOGO} width="44" height="44" alt="Win-Tradex" style={{ borderRadius: '8px' }} /></Section>
        <Text style={brandName}>Win-Tradex</Text>
        <Heading style={h1}>Your login link</Heading>
        <Text style={text}>Click below to log in to Win-Tradex. This link will expire shortly.</Text>
        <Section style={btnWrap}><Button style={button} href={confirmationUrl}>Log In</Button></Section>
        <Text style={footer}>If you didn't request this link, you can safely ignore this email.</Text>
        <Text style={copy}>© 2026 Win-Tradex. All rights reserved.</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif" }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const header = { borderBottom: '2px solid #d4af37', paddingBottom: '16px', marginBottom: '8px' }
const brandName = { fontSize: '20px', fontWeight: 'bold' as const, color: '#d4af37', margin: '0 0 20px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1a1a2e', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 20px' }
const btnWrap = { textAlign: 'center' as const, margin: '30px 0' }
const button = { backgroundColor: '#d4af37', color: '#0b0e11', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '6px', padding: '14px 32px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999', margin: '30px 0 0', borderTop: '1px solid #eee', paddingTop: '16px' }
const copy = { fontSize: '11px', color: '#bbb', margin: '8px 0 0' }
