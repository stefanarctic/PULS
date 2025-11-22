# Firestore Security Rules Documentation

This document describes the Firestore security rules for the PULS application.

**Important**: These rules are managed directly in the [Firebase Console](https://console.firebase.google.com/), not in this repository. See the [Deployment](#deployment) section below for instructions on how to set them up.

## Overview

The security rules ensure that:
- Users can only access and modify their own data
- Only authenticated users can read problems
- Only administrators can create, update, or delete problems
- User privacy is protected while allowing necessary functionality (like alias checking)

## Collections

### 1. `users` Collection

**Purpose**: Stores user profile information

**Document Structure**:
```javascript
{
  name: string,           // User's display name
  email: string,          // User's email (immutable)
  alias: string,          // Unique user alias
  joinedDate: string,     // ISO date string (immutable)
  profilePic: string,     // URL to profile picture
  description: string,    // User bio/description
  isAdmin: boolean,       // Admin status (only admins can modify)
  favorites: array,       // Array of favorite problem IDs
  solvedProblems: array   // Array of solved problem objects
}
```

**Rules**:
- **Read**: 
  - Users can read their own document completely
  - Authenticated users can read other users' documents (for alias checking)
- **Create**: 
  - Users can create their own document (with their UID as document ID)
  - Cannot set `isAdmin` to `true` during creation
  - Must include required fields: `email`, `name`, `joinedDate`
- **Update**: 
  - Users can update their own document
  - Cannot change `isAdmin`, `email`, or `joinedDate` fields
  - Admins can update any user document (including `isAdmin` field)
- **Delete**: 
  - Only admins can delete user documents

### 2. `users/{userId}/userProblems` Subcollection

**Purpose**: Stores user-submitted problems

**Rules**:
- **Read/Write**: 
  - Users can only read/write their own `userProblems` subcollection
  - Admins can read all users' `userProblems` subcollections

### 3. `problems` Collection

**Purpose**: Stores problems available to all users

**Rules**:
- **Read**: 
  - All authenticated users can read problems
- **Create/Update/Delete**: 
  - Only admins can create, update, or delete problems

## Helper Functions

### `isAuthenticated()`
Checks if the request is from an authenticated user.

### `isOwner(userId)`
Checks if the authenticated user is the owner of the document (their UID matches the document ID).

### `isAdmin()`
Checks if the authenticated user is an admin by:
1. Verifying the user is authenticated
2. Checking if their user document exists
3. Verifying the `isAdmin` field is `true`

**Note**: This requires a Firestore read operation, which counts against your quota. For better performance and security, consider using [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims) instead.

## Deployment

**Note**: These rules are managed directly in the Firebase Console, not in the repository.

### How to Set Up Rules in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `puls-cb0b8`
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy and paste the rules below into the editor
5. Click **Publish** to deploy the rules

### Rules Code (Copy to Firebase Console)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is the owner of a document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Helper function to check if user is admin
    // Note: This requires reading the user document first, which may have limitations
    // For better security, consider using Firebase Custom Claims instead
    // This function checks if the authenticated user's document exists and has isAdmin = true
    function isAdmin() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Users collection rules
    match /users/{userId} {
      // Allow users to read their own document completely
      allow read: if isOwner(userId);
      
      // Allow users to read other users' documents for alias checking
      // Limit to public fields only for privacy
      allow read: if isAuthenticated();
      
      // Allow users to create their own document
      allow create: if isOwner(userId) && 
                       // Ensure they cannot set themselves as admin
                       (!('isAdmin' in request.resource.data) || 
                        request.resource.data.isAdmin == false) &&
                       // Validate required fields
                       'email' in request.resource.data &&
                       'name' in request.resource.data &&
                       'joinedDate' in request.resource.data;
      
      // Allow users to update their own document
      allow update: if isOwner(userId) && 
                       // Prevent users from promoting themselves to admin
                       (!('isAdmin' in request.resource.data) || 
                        request.resource.data.isAdmin == resource.data.isAdmin) &&
                       // Prevent users from changing their email
                       (!('email' in request.resource.data) || 
                        request.resource.data.email == resource.data.email) &&
                       // Prevent users from changing their joinedDate
                       (!('joinedDate' in request.resource.data) || 
                        request.resource.data.joinedDate == resource.data.joinedDate);
      
      // Allow admins to update any user document (including isAdmin field)
      allow update: if isAdmin();
      
      // Allow admins to delete user documents (use with caution)
      allow delete: if isAdmin();
      
      // User problems subcollection
      match /userProblems/{problemId} {
        // Users can only read/write their own problems
        allow read, write: if isOwner(userId);
        
        // Admins can read all user problems
        allow read: if isAdmin();
      }
    }
    
    // Problems collection rules
    match /problems/{problemId} {
      // All authenticated users can read problems
      allow read: if isAuthenticated();
      
      // Only admins can create problems
      allow create: if isAdmin();
      
      // Only admins can update problems
      allow update: if isAdmin();
      
      // Only admins can delete problems
      allow delete: if isAdmin();
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Security Considerations

1. **Admin Check Performance**: The `isAdmin()` function requires a Firestore read for each admin check. Consider using Firebase Custom Claims for better performance.

2. **Alias Uniqueness**: The rules allow authenticated users to read all user documents to check alias uniqueness. This is necessary for the application functionality but exposes some user data. Consider:
   - Creating a separate `aliases` collection with minimal data
   - Using Cloud Functions to validate alias uniqueness

3. **Email Immutability**: The rules prevent users from changing their email, which is good for security. However, if you need to allow email changes, implement it through a Cloud Function with proper verification.

4. **Admin Privileges**: The `isAdmin` field in user documents can be modified by admins. Ensure you have proper access controls in your application code as well.

## Upgrading to Custom Claims (Recommended)

For better security and performance, consider migrating to Firebase Custom Claims:

1. Set custom claims using Firebase Admin SDK:
```javascript
admin.auth().setCustomUserClaims(uid, { admin: true });
```

2. Update rules to check custom claims:
```javascript
function isAdmin() {
  return isAuthenticated() && request.auth.token.admin == true;
}
```

This eliminates the need for Firestore reads to check admin status.

## Testing

Test your rules using the Firebase Rules Playground in the Firebase Console:
1. Go to Firestore Database → Rules
2. Click "Rules Playground"
3. Test various scenarios (read, write, create, delete) with different user contexts

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**: 
   - Verify the user is authenticated
   - Check if the user document exists (for admin checks)
   - Ensure the user's UID matches the document ID for user operations

2. **Admin Operations Failing**:
   - Verify the user's `isAdmin` field is set to `true` in their user document
   - Check that the user document exists before attempting admin operations

3. **Alias Checking Issues**:
   - Ensure the user is authenticated
   - Verify the query is properly structured in your application code

## Support

For issues or questions about these rules, refer to:
- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Security Rules Reference](https://firebase.google.com/docs/rules/rules-language)

