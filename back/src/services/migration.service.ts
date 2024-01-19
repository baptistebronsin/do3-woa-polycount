import { exec } from "child_process";

async function migrer(): Promise<void> {
    return new Promise((resolve, reject) => {
        exec('npm run migrate:prod', (error, stdout, _) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            console.log(stdout);
            resolve();
        });
    });
}

export default migrer;
