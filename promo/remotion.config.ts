import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Linux 헤드리스: 미리 설치된 chrome-headless-shell 을 쓰려면 REMOTION_BROWSER 에 경로를 넣는다.
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
Config.setChromiumOpenGlRenderer(process.platform === 'darwin' ? 'angle' : 'swangle');
Config.setConcurrency(process.platform === 'darwin' ? 4 : 2);
