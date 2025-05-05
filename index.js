import dotenv from "dotenv";
import { existsSync, mkdirSync, promises as fs } from "fs";
import { join } from "path";
import { exec } from "child_process";
import axios from "axios";

dotenv.config();

const REPOS = process.env.REPOS.split(",").map((r) => r.trim());
const {
  SOURCE_WORKSPACE,
  SOURCE_USERNAME,
  SOURCE_APP_PASSWORD,
  DEST_WORKSPACE,
  DEST_USERNAME,
  DEST_APP_PASSWORD,
  DEST_PROJECT_KEY,
} = process.env;

const GIT_DIR = "./repos";

const destApi = axios.create({
  baseURL: "https://api.bitbucket.org/2.0",
  auth: {
    username: DEST_USERNAME,
    password: DEST_APP_PASSWORD,
  },
});

function execGitCommand(command, repoPath) {
  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        cwd: repoPath,
        env: {
          ...process.env,
          GIT_DIR: undefined,
          GIT_WORK_TREE: undefined,
        },
      },
      (err, stdout, stderr) => {
        if (err) {
          console.error(`[${repoPath}] ❌ ${command}\n${stderr}`);
          reject(new Error(stderr));
        } else {
          resolve(stdout);
        }
      }
    );
  });
}

async function repoExists(workspace, repoSlug) {
  try {
    await destApi.get(`/repositories/${workspace}/${repoSlug}`);
    return true;
  } catch {
    return false;
  }
}

async function createRepo(workspace, repoSlug) {
  console.log(`✨ Creating repo ${workspace}/${repoSlug}...`);
  await destApi.post(`/repositories/${workspace}/${repoSlug}`, {
    scm: "git",
    is_private: true,
    project: { key: DEST_PROJECT_KEY },
  });
}

async function syncRepo(repo) {
  const repoPath = join(GIT_DIR, repo);
  const srcUrl = `https://${SOURCE_USERNAME}:${SOURCE_APP_PASSWORD}@bitbucket.org/${SOURCE_WORKSPACE}/${repo}.git`;
  const destUrl = `https://${DEST_USERNAME}:${DEST_APP_PASSWORD}@bitbucket.org/${DEST_WORKSPACE}/${repo}.git`;

  console.log(`📁 Repo path is: ${repoPath}`);

  if (!existsSync(repoPath)) {
    console.log(`📥 Cloning ${repo} as mirror...`);
    await execGitCommand(
      `git clone --mirror "${srcUrl}" "${repoPath}"`,
      process.cwd()
    );
  } else {
    console.log(`↺ Fetching updates for ${repo}...`);
    await execGitCommand("git fetch", repoPath);
  }

  const exists = await repoExists(DEST_WORKSPACE, repo);
  if (!exists) await createRepo(DEST_WORKSPACE, repo);

  console.log(`🚀 Pushing ${repo} to destination...`);
  await execGitCommand(`git remote set-url origin "${destUrl}"`, repoPath);
  await execGitCommand("git push --mirror", repoPath);
}

async function validateProject(workspace, projectKey) {
  try {
    await destApi.get(`/workspaces/${workspace}/projects/${projectKey}`);
    console.log(`✅ Project ${projectKey} exists`);
  } catch (e) {
    throw new Error(
      `❌ Project ${projectKey} does not exist in workspace ${workspace}. Please create it manually before running the script.`
    );
  }
}

async function cleanGitDir() {
  if (!existsSync(GIT_DIR)) {
    mkdirSync(GIT_DIR);
  } else {
    console.log("🧹 Cleaning old repos...");
    const files = await fs.readdir(GIT_DIR);
    for (const file of files) {
      const filePath = join(GIT_DIR, file);
      await fs.rm(filePath, { recursive: true, force: true });
    }
  }
}

async function main() {
  try {
    await validateProject(DEST_WORKSPACE, DEST_PROJECT_KEY);
    await cleanGitDir();

    for (const repo of REPOS) {
      try {
        await syncRepo(repo);
      } catch (err) {
        console.error(`❌ Failed syncing ${repo}:`, err.message);
      }
    }

    console.log("✅ All done.");
  } catch (err) {
    console.error("❌ Critical error:", err.message);
    process.exit(1);
  }
}

main();
