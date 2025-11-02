// upload-zomato.js
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

/**
 * 📂 Local image path — update this as needed.
 * Example (Windows):
 *   "C:/Users/Aakash/Downloads/Untitled design - 2025-11-01T173647.171.png"
 */
const LOCAL_FILE_PATH =
  "C:/Users/Aakash/Downloads/Untitled design - 2025-11-01T173647.171.png";

const URL =
  "https://www.zomato.com/php/online_ordering/menu_edit?action=upload_image&service_role=DELIVERY_TAKEAWAY&page_key=menu";

async function upload() {
  try {
    if (!fs.existsSync(LOCAL_FILE_PATH)) {
      throw new Error(`❌ File not found: ${LOCAL_FILE_PATH}`);
    }

    // Create multipart form data
    const form = new FormData();
    form.append("is_charge_image", "0");
    form.append("is_addon_item", "0");
    form.append("res_id", "22015050");
    form.append("data_file", fs.createReadStream(LOCAL_FILE_PATH), {
      filename: path.basename(LOCAL_FILE_PATH),
      contentType: "image/png", // adjust if jpg
    });

    // Merge form headers with custom headers
    const headers = {
      ...form.getHeaders(),
      Cookie: `PHPSESSID=c0ff2e9e5fdca4a461f77005656f1b76; X-Zomato-Mx-Auth-Token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJNZXJjaGFudE91dGxldFNlcnZpY2UiLCJleHAiOjE3NjE5OTkzNzIsImlhdCI6MTc2MTk5OTA3MiwicnJtIjp7IjE5Njg5OTY4IjpbMl0sIjE5Nzc1NTk2IjpbMl0sIjIwMjU4Njg1IjpbMl0sIjIwNjI3NDY2IjpbMl0sIjIxMDQ3NDUxIjpbMl0sIjIxMTcxMjcwIjpbMl0sIjIxMzkzMjQ1IjpbMl0sIjIxNDcwMjUyIjpbMl0sIjIxNjQ2OTY5IjpbMl0sIjIxOTE0MzY2IjpbMl0sIjIyMDEwNTY4IjpbMl0sIjIyMDE1MDUwIjpbMl0sIjIyMDMxNDAzIjpbMl0sIjIyMDUxOTI2IjpbMl0sIjIyMDU1MDc5IjpbMl0sIjIyMDYyODkyIjpbMl0sIjIyMDYyOTY0IjpbMl0sIjIyMDYzNDczIjpbMl0sIjIyMDY0MDMxIjpbMl0sIjIyMDgzODA3IjpbMl0sIjIyMDkzODU4IjpbMl0sIjIyMDk2NjQwIjpbMl0sIjIyMTAzNzczIjpbMl0sIjIyMTA0NDA0IjpbMl0sIjIyMTA4NDg0IjpbMl0sIjIyMTA4NTQ5IjpbMl0sIjIyMTExOTU2IjpbMl0sIjIyMTE2MDU0IjpbMl0sIjIyMTMxNzk0IjpbMl0sIjIyMTM1NjI5IjpbMiwzXSwiMjIxMzk5MTUiOlsyXSwiMjIxNDAwMDciOlsyXSwiMjIxNDE0OTEiOlsyXSwiMjIxNDYzNDQiOlsyXSwiMjIxNDYzOTgiOlsyXSwiMjIxNTMwMDUiOlsyXSwiMjIxNTUxNTQiOlsyXSwiMjIxNzczMzEiOlsyXSwiMjIxNzk0ODMiOlsyXSwiMjIxOTYwNjciOlsyXSwiMjIyMDEzODQiOlsyXSwiMjIyMDE1NzkiOlsyXSwiMjIyMDI3MzkiOlsyXSwiMjIyMjc3NjEiOlsyXSwiMjIyNjA2ODUiOlsyXSwiMzEyODU1IjpbMl19LCJ1SWQiOjM4MTk3OTUyMywiYkV4cCI6MTc2MjA4NTQ3Mn0.GNlxys6PptYMrY2oGb5XoQ4o79dZw1xjvDoUhyB8zsGLk9y9Qi2Kh4KF-NE-0L6IRMxuvcSlxzk1R-V-q3jGvvr-aEP5x-RxzANPx_UKBSalU65BzVHuuXZbjdW-7ALZ4-D3HcCndunXvYNaZ0e-XNXEBmud6kQIOuq7Rnhvt4bhBntvKJNYD3VMOx5wL5zd7skSGdzyFYJibxGpdy7skFbwuqIBwjYvlkk3rTBDRhwJdB0TRKdkOG-mhDqv4EdvhWxPUWHVFXs9fNcvV2yrAoVIyl4WKP07kXuInRsTDOGtaHFojADZ796Ai7DfA1jx233MrVVv6uZGGnMh9IZwvA; _abck=FF90AD02ED603ABC785B962E6C10F080~-1~YAAQfQZaaBBoPziaAQAABLoUPw4ulcLrPJ3Ohp13AOWBJGYcAfNClBaBaeiz53PgLIusyDpbYpnKbrzRquiYQX22hLBSbdL4OkKDuDi0Up1FXaPnZe6TdWVbd3rJb+2zNObqIAPmfCsKnjv2t8EehkYG6uZ6mhwhCLmaGTbZOCBHGAkWosoPfXeC2XVDyOPZAbnccrhHRUCiDuE2I1t+dH2LzgrQC1Mq/vRTfjXlBiIufrKFyvGtzXMpj7V1aNA7HPouixjo5aAgbq5p5LC+Zug2M3Wz1U8qnilVLrKjUwIqEqfeUhcTgZYHmYKC5ItGvM3Mq+8KV6KQ7hLZhLWqPzfLs97AYZkgS5w9dfTYMHTES1i8MjsEV4sokqw7Kv3xr43UjioptdolJyy7E8kuQdH9SbSXWZ6V8RimPpnjyQDKRzCTcZYplWAnZ5CTiaeM9gJCGZKo3pJ8K6Z7AGXdUmZeKoIODg==~-1~-1~-1~-1~-1; _fbp=fb.1.1760035742562.433283264457671165; _ga=GA1.1.775858925.1760031220; _ga_2NKE6R5GNY=GS2.2.s1761048197$o1$g1$t1761049823$j59$l0$h0; _ga_2XVFHLPTVP=GS2.1.s1761048197$o8$g1$t1761049842$j40$l0$h0; _ga_3NH52KS4KE=GS2.2.s1760100969$o3$g1$t1760101594$j57$l0$h0; _ga_BRHMGFMFMJ=GS2.2.s1760255841$o2$g1$t1760255844$j57$l0$h0; _ga_EFHVMKBS6L=GS2.1.s1761994914$o22$g1$t1761995065$j50$l0$h0; _ga_VEX4KRY429=GS2.2.s1760076590$o1$g1$t1760076593$j57$l0$h0; _ga_X6B66E85ZJ=GS2.2.s1761048197$o6$g1$t1761049823$j59$l0$h0; _gcl_au=1.1.908613762.1760035741; ak_bmsc=8831239EC31EC6EA2F1EE05F662ADF41~000000000000000000000000000000~YAAQD3BWuDcsNRqaAQAAWT4oPx0ZmhUJ1IlurN/fdUHyI6SpgJkn/FyVzKiL9vP8sBjpurQzgZ/H0x8AfwZJOyo9Kus7ecRCpLsTCSnCXtdvh09ECgEvX6Hl/27WS9e+UvsoWlyzud8cFKr/nr0qlCEM9BpmcALasarcl+EYDDTlp8YN3VzP8jwuGUIaY5plkf4Z4AsEYL5nOs6zkphMOLCiKydziwCW97tArXrorJQgYhTj5SF7F4ekOCgvdpOkFXT5gCy973IJdCpkIV8LEyuNt8WHohrH/E8OmUhMPdHivxSUIObtXnj8XVCX6OUv992ydSfErlVbMXVvw1ISdmgXS3w7TFNN9tRejd9c5eXGdQxM2QB89pg=; bm_sv=9BA3065178162E76198C913EDE3C34CF~YAAQJXBWuBVTTSeaAQAAL/9aPx29zIHonq6/Wbl1CQzhDCEhRlZynlcSiux/kUNv9mfcrmtZMD2I8oIWYLLinxjcMFZ1pxtP2GO6sW6fnuVSnVyFfx5vttXKarqz5Qw0pru6ZrbJASvjYKSQarwI17txiVGZkRCBCaY1zgrE7doSGi9mCtbryVm2Hce96Oh5IailqXOw9H74tfc9FfHnGCAO4Qc45yy74TIqERC4kwxGYhhx2EJM3afgUd2MeRrW2BU=~1; bm_sz=A7C8B7900648A5C026152091326B3A7B~YAAQfQZaaBFoPziaAQAABLoUPx0srLjnXix0ZMv7aIbyw+QYlcCXT84dvifrve4lPBZxZpVBApMr7moWepZhySQTZEq70FPY4Yuc4nvanNu/TQHb9PwBY5ExvVc/Y3rHmMe8zThVv3srZY5duaLo/YoJTJNnxHouFrnXnLEj1Ccl7kpYKNZgvlmJZqCcKkyqtoLjOEze9lAsjxU3QX6pAYgBi8hJ/cCXCdeKRUC3HBFiL5XAzEu86X9paAml6GiEOwfCpZs6KJaS7cK0hJ6L24lO1rHze2T+HoLgOPFNx3e8MbA/8juE84dsdvYtAHDY/H35jm3MHeunNmGvK8Oh8EGCzUvej6Ql5TubWEeofY3uSdxqPdd6jBk=~4340022~3752260; cid=2c4e3ed9-0308-4d16-a237-3a5c99f7e944; csrf=5c622f3162cd99afef514e50b9c7de5d; fbcity=11; fbtrack=a5f193411d237a899bee569ed3e1883b; fre=0; hy-en=1; rd=1380000; socket_service_version=v2; ttaz=1763637286; zat=H-UTVnUYGQCKXPujApcKAS6zjWfaGL6kdFKcgyjFolc.PcQm0nB_2Zdm2PKzqQS__VXZ0bnv8o4S66tOBlm5yRk; zl=en; AWSALBTG=rkXmnAvZVql61W3JexlJU4XLdXRODljAZDsdEs4+XqwuawqlTbMwATvzmXNhYFv35bDJ5qqrX0Y4eU0Ntka/6E76E11e3VsGuYfgUqWgJWFM0AmtfcuTLB2qbRuL9suYakcSesSsFVfQvgY9qv32xzZJC/WdjO5qa+BfvWNOD2qE; AWSALBTGCORS=rkXmnAvZVql61W3JexlJU4XLdXRODljAZDsdEs4+XqwuawqlTbMwATvzmXNhYFv35bDJ5qqrX0Y4eU0Ntka/6E76E11e3VsGuYfgUqWgJWFM0AmtfcuTLB2qbRuL9suYakcSesSsFVfQvgY9qv32xzZJC/WdjO5qa+BfvWNOD2qE; G_ENABLED_IDPS=google; _dd_s=rum=2&id=fbabfd92-25d6-4ace-8074-cf5478325779&created=1761994913863&expire=1762000236603; g_state={"i_l":0,"i_ll":1761049822152,"i_b":"D3dFFkyVkWHtZfdH1zLl49mM6GkLb4v20fF1MB57FAg"}; locus=%7B%22addressId%22%3A0%2C%22lat%22%3A23.042662%2C%22lng%22%3A72.566729%2C%22cityId%22%3A11%2C%22ltv%22%3A11%2C%22lty%22%3A%22city%22%2C%22fetchFromGoogle%22%3Afalse%2C%22dszId%22%3A3720%2C%22fen%22%3A%22Ahmedabad%22%7D; ltv=11; lty=11`,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      Origin: "https://www.zomato.com",
      Referer: "https://www.zomato.com/",
      "X-Requested-With": "XMLHttpRequest",
    };

    // Send request
    const response = await axios.post(URL, form, {
      headers,
      maxRedirects: 5, // follow redirects
      validateStatus: (status) => status < 500, // don't throw on 4xx
      timeout: 30000,
    });

    console.log("✅ Upload complete");
    console.log("Status:", response.status);
    console.log("Response:", response.data);
  } catch (err) {
    console.error("🚨 Upload error:", err.message);

    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Headers:", err.response.headers);
      console.error(
        "Data (truncated):",
        String(err.response.data).slice(0, 1000)
      );
    }
  }
}

upload();
