const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const { GitHub, context } = require('@actions/github');

async function run() {
    try {
        const github = new GitHub(process.env.GITHUB_TOKEN);

        const { owner, repo } = context.repo;

        const version = core.getInput('version', { required: false });
        const draft = false;
        const release_id = core.getInput('release_id', { required: false });

        const releaseNotesPath = path.join(__dirname, '../../../../release-notes.md');
        const releaseNotes = fs.readFileSync(releaseNotesPath, 'utf8');
        const regex = new RegExp(
            `#####\\s+v${version.replace(/\./g, '\\.')}.*?\n([\\s\\S]*?)\n#####`
        );
        const body = releaseNotes
            .match(regex)[1]
            .trim()
            .replace(/\s*\n/g, '\n');

        console.log(`Updating release with notes:\n${body}`);

        await github.repos.updateRelease({
            owner,
            repo,
            release_id,
            body,
            draft
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
