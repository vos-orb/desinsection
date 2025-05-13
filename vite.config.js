import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';

export default {
build: {
    outDir: '../dist',
    emptyOutDir: true,
	assestsDir: './assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, './', 'index.html'),
		styles: resolve(__dirname, './css','src/styles/styles.scss')
      },
    },
  },
	plugins: [
		handlebars({
			context: {
				title: 'Hello, world!',
				description: 'test description',
				ogType: 'test ogType',
			},
			partialDirectory: resolve(__dirname, 'src/_partials'),
		}), 
	],
	resolve: {
		alias: {
			'styles': resolve(__dirname, 'src/styles'),
		},
	},
};