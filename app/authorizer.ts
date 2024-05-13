import jwt from 'jsonwebtoken';
const JWT_SECRET = "my_secret"

export const handler = async(event: AuthorizerEvent): Promise<AuthorizerResponse> => {
  console.log("Init lambda authorizer...")
  console.log({event})

  const DenyPolicy = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "execute-api:Invoke",
        "Effect": "Deny",
        "Resource": event.methodArn,
      }
    ]
  }

  const AllowPolicy = {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Action": "execute-api:Invoke",
        "Effect": "Allow",
        "Resource": event.methodArn,
      }
    ]
  }

  let response: AuthorizerResponse = {
    principalId: "user",
    policyDocument: AllowPolicy,
    context: {
      "userId": null,
    }
  };


  jwt.verify(event.authorizationToken, JWT_SECRET, function(err, decoded) {
    console.log("Verifying JWT...")
    console.log({decoded})

    if (err) {
      return response
    } else {
      let context = {
        "userId": 1,
      }
      response.policyDocument = AllowPolicy
      response.context = context
      return response
    }
  });

  console.log("Returning lambda authorizer response")
  console.log(response)
  return response;
};
