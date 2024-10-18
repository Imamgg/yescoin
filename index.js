const fs = require("fs");
const figlet = require("figlet");
const clc = require("cli-color");
const dotenv = require("dotenv");
const moment = require("moment");

dotenv.config();

const decodeQuery = (query) => {
  const dec = decodeURIComponent(query);
  return dec;
};

const makeFetchRequest = async (url, method, token, body = null) => {
  const headers = {
    accept: "application/json, text/plain, */*",
    "content-type": "application/json",
    token: token || "",
    "user-agent": "Mozilla/5.0",
  };

  const options = {
    method: method,
    headers: headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`Fetch request failed: ${err}`);
    throw err;
  }
};

const createToken = async (query) => {
  const url = "https://api-backend.yescoin.gold/user/login";
  const payload = { code: `${query}` };
  return await makeFetchRequest(url, "POST", null, payload);
};

const getAccountInfo = async (token) => {
  const url = "https://api-backend.yescoin.gold/account/getAccountInfo";
  return await makeFetchRequest(url, "GET", token);
};

const getGameInfo = async (token) => {
  const url = "https://api-backend.yescoin.gold/game/getGameInfo";
  return await makeFetchRequest(url, "GET", token);
};

const getTaskList = async (token) => {
  const url = "https://api-backend.yescoin.gold/task/getCommonTaskList";
  return await makeFetchRequest(url, "GET", token);
};

const getAccountBuildInfo = async (token) => {
  const url = "https://api-backend.yescoin.gold/build/getAccountBuildInfo";
  return await makeFetchRequest(url, "GET", token);
};

const getDailyMission = async (token) => {
  const url = "https://api-backend.yescoin.gold/mission/getDailyMission";
  return await makeFetchRequest(url, "GET", token);
};

const finishDailyMission = async (token, missionid) => {
  const url = "https://api-backend.yescoin.gold/mission/finishDailyMission";
  const payload = JSON.stringify(missionid);
  return await makeFetchRequest(url, "POST", token, payload);
};

const offline = async (token) => {
  const url = "https://api-backend.yescoin.gold/user/offline";
  return await makeFetchRequest(url, "POST", token);
};

const collectCoin = async (token, cointoclaim) => {
  const url = "https://api-backend.yescoin.gold/game/collectCoin";
  const payload = JSON.stringify(cointoclaim - 10);
  return await makeFetchRequest(url, "POST", token, payload);
};

const levelUp = async (token, idboost) => {
  const url = "https://api-backend.yescoin.gold/build/levelUp";
  const payload = JSON.stringify(idboost);
  return await makeFetchRequest(url, "POST", token, payload);
};

const getUserUpgradeTaskList = async (token) => {
  const url = "https://api-backend.yescoin.gold/task/getUserUpgradeTaskList";
  return await makeFetchRequest(url, "GET", token);
};

const finishUserUpgradeTask = async (token, upid) => {
  const url = "https://api-backend.yescoin.gold/task/finishUserUpgradeTask";
  const payload = JSON.stringify(Number(upid));
  return await makeFetchRequest(url, "POST", token, payload);
};

const claimTask = async (token, taskid) => {
  const url = "https://api.yescoin.gold/task/finishTask";
  const payload = JSON.stringify(taskid);
  return await makeFetchRequest(url, "POST", token, payload);
};

const specialBoxReloadPage = async (token) => {
  const url = "https://api.yescoin.gold/game/specialBoxReloadPage";
  return await makeFetchRequest(url, "GET", token);
};

const recoverCoinPool = async (token) => {
  const url = "https://api.yescoin.gold/game/recoverCoinPool";
  return await makeFetchRequest(url, "POST", token);
};

const getSpecialBoxInfo = async (token) => {
  const url = "https://api.yescoin.gold/game/getSpecialBoxInfo";
  return await makeFetchRequest(url, "GET", token);
};

const collectSpecialBoxCoin = async (token, boxtype, amount) => {
  const url = "https://api.yescoin.gold/game/collectSpecialBoxCoin";
  const payload = JSON.stringify({
    boxType: boxtype,
    coinCount: amount,
  });
  return await makeFetchRequest(url, "POST", token, payload);
};

const recoverSpecialBox = async (token) => {
  const url = "https://api.yescoin.gold/game/recoverSpecialBox";
  return await makeFetchRequest(url, "POST", token);
};

const claimBonus = async (token, taskid) => {
  const url = "https://api-backend.yescoin.gold/task/claimBonus";
  const payload = JSON.stringify(taskid);
  return await makeFetchRequest(url, "POST", token, payload);
};

const shareJourney = async (token) => {
  const url = "https://api-backend.yescoin.gold/user/share";
  const payload = JSON.stringify({});
  return await makeFetchRequest(url, "POST", token, payload);
};

const runCreateToken = async () => {
  try {
    const data = fs.readFileSync("data.txt", "utf-8");
    const querys = data.split("\n");

    const tokens = await Promise.all(
      querys.map(async (query) => {
        try {
          const decodequery = decodeQuery(query);
          const token = await createToken(decodequery);
          return token?.data?.token || "";
        } catch (err) {
          console.error(err);
          return "";
        }
      })
    );

    // Filter tokens yang kosong sebelum ditulis
    const validTokens = tokens.filter(Boolean).join("\n");
    fs.writeFileSync("tokens.txt", validTokens);

    return true;
  } catch (e) {
    if (e.code === "ENOENT") {
      console.log("Fill the data.txt first!");
      fs.writeFileSync("data.txt", "query1\nquery2\netc...");
      return false;
    } else {
      throw e;
    }
  }
};


const countLength = (n) => {
  const num = String(n);
  return num.length;
};

const timeCount = async (finish, nanti, waktu) => {
  const formatTime = (waktu) => {
    const minutes = String(Math.floor(waktu / 60)).padStart(2, "0");
    const seconds = String(waktu % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  for (let i = waktu; i >= 0; i--) {
    const formattedTime = formatTime(i);

    process.stdout.write(
      `Execution time: ${clc.yellow(finish.toFixed(2))} seconds | ` +
        `Refresh token: ${clc.yellow(
          moment.unix(nanti).format("YYYY-MM-DD HH:mm:ss")
        )} | ` +
        `Refresh after: ${clc.yellow(formattedTime)}`
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }
};


// async func to sendmessage to telegram
const sendMessage = async (total) => {
  const telegram_token = String(process.env.TELEGRAM_TOKEN);
  const telegram_chatid = String(process.env.TELEGRAM_CHATID);
  const message = `Total yescoin : ${total}`;

  if (telegram_token != "" && telegram_chatid != "") {
    const url = `https://api.telegram.org/bot${telegram_token}/sendMessage?chat_id=${telegram_chatid}&text=${message}`;

    while (true) {
      try {
        const response = await fetch(url);

        if (response.status == 200) {
          return response.data;
        }
      } catch (err) {
        console.log(`Error to sendMessage, ${err}`);
        continue;
      }
    }
  } else {
    return;
  }
};

const showHeader = () => {
  console.log(
    clc.cyanBright(figlet.textSync("YescoinBot", { font: "Ogre" }))
  );
  console.log(
    clc.cyanBright("=========================================================")
  );
  console.log(
    clc.greenBright(`Start Time: ${moment().format("YYYY-MM-DD HH:mm:ss")}`)
  );
  console.log(
    clc.cyanBright(
      "=========================================================\n"
    )
  );
};

const showStatus = (label, status) => {
  const statusText = status ? clc.green("Success") : clc.red("Failed");
  console.log(`${label}: ${statusText}`);
};

const showProgress = (current, total) => {
  const progress = Math.round((current / total) * 20); // progress in 20 steps
  const bar = `[${"=".repeat(progress)}${" ".repeat(
    20 - progress
  )}] ${current}/${total}`;
  process.stdout.write(`Progress: ${clc.yellow(bar)}\r`);
};

(async () => {
  // clear CLI dan tampilkan header
  console.clear();
  showHeader();

  console.log(clc.yellow("Initializing token creation process..."));

  const restoken = await runCreateToken();
  showStatus("Create token", restoken);

  if (restoken) {
    console.log(clc.greenBright("\nToken creation successful!"));

    let sekarang = Math.trunc(Date.now() / 1000);
    let nanti =
      Math.trunc(Date.now() / 1000) + Number(process.env.REFRESH_TOKEN);

    // Progress bar setup
    const tokens = fs
      .readFileSync("tokens.txt", "utf-8")
      .split("\n")
      .filter(Boolean); // Read the token file
    let totalTokens = tokens.length;
    let currentProgress = 0;

    while (sekarang < nanti) {
      console.clear();
      showHeader();

      console.log(clc.blue("Processing accounts and tokens...\n"));
      showProgress(currentProgress, totalTokens);

      const runall = await Promise.all(
        tokens.map(async (token, idx) => {
          if (token != "") {
            const account = await getAccountInfo(token);
            let game_info = await getGameInfo(token);
            const account_info = await getAccountBuildInfo(token);
            let current_amounts = account?.data?.currentAmount || 0;
            let coinleft = Math.round(
              (game_info?.data?.coinPoolLeftCount || 0) / 10
            );

            const daily_mission = await getDailyMission(token);
            let status_daily = "-";
            if (daily_mission?.code === 0) {
              status_daily = daily_mission?.data?.every(
                (m) => m.missionStatus !== 0
              )
                ? clc.green("Done")
                : clc.yellow("Claim daily");
            }

            console.log(
              `[Account ${
                idx + 1
              }] | Daily mission: ${status_daily} | Coin left: ${clc.yellow(
                coinleft
              )} | Balance: ${clc.green(
                current_amounts.toLocaleString("en-US")
              )}`
            );

            // Naikkan progress
            currentProgress++;
            showProgress(currentProgress, totalTokens);

            return current_amounts;
          }
        })
      );

      // Total balance
      let totalallacc = runall.reduce((acc, val) => acc + (val || 0), 0);
      console.log("\n");
      console.log(
        clc.greenBright(`Total balance: ${totalallacc.toLocaleString("en-US")}`)
      );

      let finish = Date.now() / 1000 - sekarang;
      await timeCount(finish, nanti, Number(process.env.REFRESH_CLAIM));

      sekarang = Math.trunc(Date.now() / 1000);
      if (sekarang >= nanti) {
        console.log("\nRefreshing tokens...");
        const refreshSuccess = await runCreateToken();
        if (refreshSuccess) {
          console.log(clc.greenBright("Tokens refreshed successfully!"));
        }
        nanti =
          Math.trunc(Date.now() / 1000) + Number(process.env.REFRESH_TOKEN);
      }

      console.clear();
    }
  } else {
    console.log(clc.redBright("Token creation failed! Please check logs."));
  }
})();
