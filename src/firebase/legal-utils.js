import { db } from './index'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth } from './index'

// Collection name for legal documents
const LEGAL_COLLECTION = 'legal_content'

// Default content for Terms of Service
const DEFAULT_TERMS = {
  title: 'Terms of Service',
  content: [
    {
      heading: 'Acceptance of Terms',
      text: 'By accessing and using the Code4U platform, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.'
    },
    {
      heading: 'Use License',
      text: 'Permission is granted to temporarily use the Code4U platform for personal, educational, and non-commercial purposes only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials except as required for normal platform usage; use the materials for any commercial purpose; attempt to decompile or reverse engineer any software; remove any copyright or other proprietary notations; transfer the materials to another person or "mirror" the materials on any other server.'
    },
    {
      heading: 'User Accounts',
      text: 'To access certain features of the platform, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to immediately notify Code4U of any unauthorized use of your account or any other breach of security.'
    },
    {
      heading: 'User Content',
      text: 'Any code or content you submit, post, or display on or through Code4U is your responsibility. You retain ownership of your content, but grant Code4U a worldwide, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content for educational and platform improvement purposes.'
    },
    {
      heading: 'Disclaimer',
      text: 'The materials on the Code4U platform are provided on an \'as is\' basis. Code4U makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
    },
    {
      heading: 'Limitations',
      text: 'In no event shall Code4U or its suppliers be liable for any damages arising out of the use or inability to use the materials on the platform, even if Code4U or an authorized representative has been notified orally or in writing of the possibility of such damage.'
    },
    {
      heading: 'Governing Law',
      text: 'These terms and conditions are governed by and construed in accordance with local laws, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.'
    },
    {
      heading: 'Changes to Terms',
      text: 'Code4U reserves the right, at its sole discretion, to modify or replace these Terms at any time. It is your responsibility to check these Terms periodically for changes. Your continued use of the platform following the posting of any changes constitutes acceptance of those changes.'
    }
  ],
  lastUpdated: new Date().toISOString().split('T')[0]
}

// Default content for Privacy Policy
const DEFAULT_PRIVACY = {
  title: 'Privacy Policy',
  content: [
    {
      heading: 'Introduction',
      text: 'At Code4U, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.'
    },
    {
      heading: 'Information We Collect',
      text: 'We may collect information about you in various ways, including: Personal Data (name, email address, and profile picture obtained through Google authentication), Usage Data (information on how you interact with our platform, including completed levels, code solutions, and achievement records), and Technical Data (IP address, browser type, device information, and cookies to improve your experience).'
    },
    {
      heading: 'How We Use Your Information',
      text: 'We may use the information we collect about you for various purposes: to provide and maintain our platform, to personalize your experience, to improve our platform, to track your progress and achievements, to communicate with you, and to ensure the security of our platform.'
    },
    {
      heading: 'Storage and Protection',
      text: 'Your data is stored securely in Firebase, including Firebase Authentication, Firestore, and Firebase Storage. We implement measures designed to protect your information from unauthorized access, alteration, disclosure, or destruction.'
    },
    {
      heading: 'Data Sharing',
      text: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this Privacy Policy or as required by law.'
    },
    {
      heading: 'Third-Party Services',
      text: 'We use Google services for authentication. Google may collect information as governed by their privacy policy. We encourage you to review Google\'s privacy practices.'
    },
    {
      heading: 'Your Rights',
      text: 'You have the right to access, update, or delete your personal information. You can manage your profile through the platform\'s profile settings or contact us for assistance.'
    },
    {
      heading: 'Children\'s Privacy',
      text: 'Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.'
    },
    {
      heading: 'Changes to This Privacy Policy',
      text: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.'
    },
    {
      heading: 'Contact Us',
      text: 'If you have any questions about this Privacy Policy, please contact us at privacy@Code4U.example.com.'
    }
  ],
  lastUpdated: new Date().toISOString().split('T')[0]
}

/**
 * Initialize default legal documents in Firestore if they don't exist and user is authenticated
 */
export async function initializeLegalDocuments() {
  // Only try to initialize if user is authenticated
  if (!auth.currentUser) return;

  try {
    // Terms of Service initialization
    const termsDoc = await getDoc(doc(db, LEGAL_COLLECTION, 'terms_of_service'))
    if (!termsDoc.exists()) {
      await setDoc(doc(db, LEGAL_COLLECTION, 'terms_of_service'), DEFAULT_TERMS)
    }

    // Privacy Policy initialization
    const privacyDoc = await getDoc(doc(db, LEGAL_COLLECTION, 'privacy_policy'))
    if (!privacyDoc.exists()) {
      await setDoc(doc(db, LEGAL_COLLECTION, 'privacy_policy'), DEFAULT_PRIVACY)
    }
  } catch (error) {
    console.error('Error initializing legal documents:', error)
    // We'll proceed without initialization if there's an error
    // The getLegalDocument function will fall back to defaults
  }
}

/**
 * Fetch legal document content from Firestore
 * @param {string} documentId - 'terms_of_service' or 'privacy_policy'
 * @returns {Promise<Object>} - The document data
 */
export async function getLegalDocument(documentId) {
  try {
    const docSnap = await getDoc(doc(db, LEGAL_COLLECTION, documentId))
    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      console.warn(`Legal document ${documentId} not found in Firestore, using default`)
      // Return default content if document doesn't exist in Firestore
      return documentId === 'terms_of_service' ? DEFAULT_TERMS : DEFAULT_PRIVACY
    }
  } catch (error) {
    console.warn('Error accessing Firestore, using default legal content:', error)
    // Return default content on error
    return documentId === 'terms_of_service' ? DEFAULT_TERMS : DEFAULT_PRIVACY
  }
}
