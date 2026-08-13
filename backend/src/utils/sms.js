const sendSMSOTP = async (phone, otp) => {
  const apiKey =
    process.env.TWOFActor_API_KEY;

  if (!apiKey) {
    throw new Error(
      "TWOF_ACTOR_API_KEY is not configured."
    );
  }

  const cleanPhone = phone
    .replace(/\D/g, "")
    .replace(/^91/, "");

  const url =
    `https://2factor.in/API/V1/${apiKey}/SMS/${cleanPhone}/${otp}`;

  const response = await fetch(url, {
    method: "POST",
  });

  const rawResponse =
    await response.text();

  console.log(
    "2Factor HTTP status:",
    response.status
  );

  console.log(
    "2Factor response:",
    rawResponse
  );

  if (!response.ok) {
    throw new Error(
      `2Factor request failed: HTTP ${response.status}`
    );
  }

  let data;

  try {
    data = JSON.parse(rawResponse);
  } catch {
    /*
     * Some versions of the old 2Factor API
     * may return a non-JSON response.
     * The HTTP status is more important here.
     */

    return {
      success: true,
      rawResponse,
    };
  }

  if (
    data.Status &&
    data.Status.toLowerCase() !==
      "success"
  ) {
    throw new Error(
      data.Details ||
        "2Factor rejected the OTP request."
    );
  }

  return data;
};

export default sendSMSOTP;