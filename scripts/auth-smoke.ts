import { signupApi, loginApi, meApi } from "../src/api/authApi";

async function run() {
  const email = `fe.smoke.${Date.now()}@example.com`;
  const password = "smokePass123";

  const signup = await signupApi({
    name: "FE Smoke",
    email,
    password,
  });

  const login = await loginApi({
    email,
    password,
  });

  const me = await meApi(login.token ?? "");

  let badLoginRejected = false;
  try {
    await loginApi({ email, password: "wrongPass" });
  } catch {
    badLoginRejected = true;
  }

  console.log(
    JSON.stringify({
      email,
      signup,
      login,
      me,
      badLoginRejected,
    })
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
