import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: "public_6rkxL+q+51xT8d2+GHpJeNSzOTE=",
  privateKey: "private_oJjrNiZncRmpFuzBumLFxAk1NWg=",
  urlEndpoint: "https://ik.imagekit.io/v0wqjmdfc"
});

export default function handler(req, res) {
  const authParams = imagekit.getAuthenticationParameters();
  res.status(200).json(authParams);
}
