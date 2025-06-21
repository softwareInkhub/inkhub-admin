import {
  CognitoUserPool,
  ICognitoUserAttributeData,
  AuthenticationDetails,
  CognitoUser,
} from 'amazon-cognito-identity-js';
import { v4 as uuidv4 } from 'uuid';

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID!,
};

const userPool = new CognitoUserPool(poolData);

export const registerUser = (username: string, email: string, password: string, role: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const attributeList: ICognitoUserAttributeData[] = [
      {
        Name: 'email',
        Value: email,
      },
      // IMPORTANT: You must create a "custom attribute" in your Cognito User Pool
      // called "role" for this to work.
      {
        Name: 'custom:role',
        Value: role,
      },
    ];

    userPool.signUp(username, password, attributeList, [], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

export const loginUser = (email: string, password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        resolve(session.getIdToken().getJwtToken());
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}; 