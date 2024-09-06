'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toPng } from 'html-to-image';
import { Download, Share2, Moon, Sun, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import parserCss from 'prettier/parser-postcss';
import parserTypescript from 'prettier/parser-typescript';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CodeSnapgram() {
	const [code, setCode] = useState('');
	const [language, setLanguage] = useState('javascript');
	const [fontSize, setFontSize] = useState(14);
	const [generatedSnippet, setGeneratedSnippet] = useState('');
	const [previewHtml, setPreviewHtml] = useState('');
	const [previewCss, setPreviewCss] = useState('');
	const [previewJs, setPreviewJs] = useState('');
	const snippetRef = useRef<HTMLDivElement>(null);
	const { theme, setTheme } = useTheme();
	const [showAlert, setShowAlert] = useState(false);
	const [activeTab, setActiveTab] = useState('snippet');

	const beautifyCode = async (code: string, language: string) => {
		try {
			let formattedCode = code;
			switch (language) {
				case 'javascript':
					formattedCode = await prettier.format(code, {
						parser: 'babel',
						plugins: [parserBabel]
					});
					break;
				case 'typescript':
					formattedCode = await prettier.format(code, {
						parser: 'typescript',
						plugins: [parserTypescript]
					});
					break;
				case 'html':
					formattedCode = await prettier.format(code, {
						parser: 'html',
						plugins: [parserHtml]
					});
					break;
				case 'css':
					formattedCode = await prettier.format(code, {
						parser: 'css',
						plugins: [parserCss]
					});
					break;
				default:
					return code;
			}
			return formattedCode.trim();
		} catch (error) {
			console.error('Error beautifying code:', error);
			return code;
		}
	};

	const handleGenerateSnippet = async () => {
		setLanguage(language);
		const beautifiedCode = await beautifyCode(code, language);
		setGeneratedSnippet(beautifiedCode);

		if (language === 'html') {
			setPreviewHtml(beautifiedCode);
		} else if (language === 'css') {
			setPreviewCss(beautifiedCode);
		} else if (language === 'javascript' || language === 'typescript') {
			setPreviewJs(beautifiedCode);
		}
	};

	const handleDownload = async () => {
		if (snippetRef.current === null) {
			return;
		}
		try {
			const dataUrl = await toPng(snippetRef.current, {
				cacheBust: true,
				pixelRatio: 2,
				width: snippetRef.current.clientWidth,
				height: snippetRef.current.clientHeight,
				skipAutoScale: true,
				style: {
					transform: 'scale(1)',
					transformOrigin: 'center'
				}
			});
			const link = document.createElement('a');
			link.download = 'code-snippet.png';
			link.href = dataUrl;
			link.click();
			setShowAlert(true);
			setTimeout(() => setShowAlert(false), 3000);
		} catch (err) {
			console.error('Error downloading image:', err);
		}
	};

	const handleShare = async () => {
		if (snippetRef.current === null) {
			return;
		}
		try {
			const dataUrl = await toPng(snippetRef.current, {
				cacheBust: true,
				pixelRatio: 2,
				width: snippetRef.current.clientWidth,
				height: snippetRef.current.clientHeight,
				skipAutoScale: true,
				style: {
					transform: 'scale(1)',
					transformOrigin: 'center'
				}
			});

			const blob = await (await fetch(dataUrl)).blob();
			const file = new File([blob], 'code-snippet.png', { type: 'image/png' });

			if (navigator.canShare && navigator.canShare({ files: [file] })) {
				navigator
					.share({
						title: 'Check out my code snippet!',
						text: 'I created this code snippet using Code Snapgram.',
						files: [file]
					})
					.then(() => {
						setShowAlert(true);
						setTimeout(() => setShowAlert(false), 3000);
					})
					.catch(console.error);
			} else {
				const link = document.createElement('a');
				link.href = dataUrl;
				link.download = 'code-snippet.png';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				setShowAlert(true);
				setTimeout(() => setShowAlert(false), 3000);
			}
		} catch (err) {
			console.error('Error sharing image:', err);
		}
	};

	return (
		<motion.main
			className='flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			<div className='w-full max-w-6xl mx-auto'>
				<div className='flex justify-between items-center mb-6'>
					<motion.h1
						className='text-3xl md:text-4xl font-bold text-purple-800 dark:text-purple-300'
						initial={{ scale: 0.5, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 0.5, duration: 0.5 }}
					>
						<Sparkles className='inline-block mr-2' /> Code Snapgram
					</motion.h1>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant='outline'
									size='icon'
									onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
									className='bg-white dark:bg-gray-800'
								>
									<Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
									<Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
									<span className='sr-only'>Toggle theme</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Toggle theme</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<Card className='p-6 md:p-8 space-y-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl'>
					<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
						<motion.div
							className='space-y-6'
							initial={{ x: -50, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ delay: 0.7, duration: 0.5 }}
						>
							<div className='space-y-2'>
								<Label
									htmlFor='code-input'
									className='text-lg font-semibold text-gray-700 dark:text-gray-300'
								>
									Code Snippet
								</Label>
								<Textarea
									id='code-input'
									placeholder='Enter your code here'
									className='font-mono bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 h-64 md:h-80 border-2 border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200'
									value={code}
									onChange={(e) => setCode(e.target.value)}
								/>
							</div>
							<div className='grid grid-cols-2 gap-6'>
								<div className='space-y-2'>
									<Label
										htmlFor='language-select'
										className='text-gray-700 dark:text-gray-300'
									>
										Language
									</Label>
									<Select value={language} onValueChange={setLanguage}>
										<SelectTrigger
											id='language-select'
											className='bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 border-purple-300 dark:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
										>
											<SelectValue placeholder='Select a language' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='javascript'>JavaScript</SelectItem>
											<SelectItem value='typescript'>TypeScript</SelectItem>
											<SelectItem value='html'>HTML</SelectItem>
											<SelectItem value='css'>CSS</SelectItem>
											<SelectItem value='python'>Python</SelectItem>
											<SelectItem value='java'>Java</SelectItem>
											<SelectItem value='csharp'>C#</SelectItem>
											<SelectItem value='cpp'>C++</SelectItem>
											<SelectItem value='plaintext'>Other</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className='space-y-2'>
									<Label
										htmlFor='font-size-slider'
										className='text-gray-700 dark:text-gray-300'
									>
										Font Size: {fontSize}px
									</Label>
									<Slider
										id='font-size-slider'
										min={8}
										max={24}
										step={1}
										value={[fontSize]}
										onValueChange={(value) => setFontSize(value[0])}
										className='cursor-pointer'
									/>
								</div>
							</div>
							<Button
								className='w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200'
								onClick={handleGenerateSnippet}
							>
								Generate Snippet
							</Button>
						</motion.div>
						<motion.div
							className='space-y-4'
							initial={{ x: 50, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ delay: 0.9, duration: 0.5 }}
						>
							<Label className='text-lg font-semibold text-gray-700 dark:text-gray-300'>
								Generated Snippet
							</Label>
							{generatedSnippet && (
								<Tabs
									defaultValue='snippet'
									className='w-full'
									onValueChange={(value) => setActiveTab(value)}
								>
									<TabsList className='grid w-full grid-cols-2 mb-4'>
										<TabsTrigger
											value='snippet'
											className='text-sm md:text-base'
										>
											Snippet
										</TabsTrigger>
										<TabsTrigger
											value='preview'
											disabled={
												!['html', 'css', 'javascript', 'typescript'].includes(
													language
												)
											}
											className='text-sm md:text-base'
										>
											Preview
										</TabsTrigger>
									</TabsList>
									<TabsContent value='snippet'>
										<div className='relative w-full p-4 rounded-lg shadow-lg overflow-hidden'>
											<div
												ref={snippetRef}
												className='rounded-lg overflow-hidden shadow-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-4'
												style={{ height: 'auto' }}
											>
												<div className='rounded-lg overflow-y-auto bg-gray-900 p-4 relative flex flex-col h-full'>
													<div className='absolute top-2 left-2 flex space-x-1'>
														<div className='w-3 h-3 rounded-full bg-red-500'></div>
														<div className='w-3 h-3 rounded-full bg-yellow-500'></div>
														<div className='w-3 h-3 rounded-full bg-green-500'></div>
													</div>
													<SyntaxHighlighter
														language={language}
														style={atomDark}
														customStyle={{
															fontSize: `${fontSize}px`,
															padding: '1rem',
															borderRadius: '0.5rem',
															background: 'transparent',
															margin: 0,
															flex: 1,
															overflowY: 'auto'
														}}
													>
														{generatedSnippet}
													</SyntaxHighlighter>
													<div className='text-[0.5rem] text-gray-400 opacity-75 font-semibold mt-2 text-center'>
														Made with ❤️ using Next.js by Aditya
													</div>
												</div>
											</div>
										</div>
									</TabsContent>
									<TabsContent value='preview'>
										<div className='relative w-full p-4 rounded-lg shadow-lg overflow-hidden bg-white h-80'>
											<iframe
												srcDoc={`
                          <html>
                            <head>
                              <style>${previewCss}</style>
                            </head>
                            <body>
                              ${previewHtml}
                              <script>${previewJs}</script>
                            </body>
                          </html>
                        `}
												className='w-full h-full border-none'
												title='HTML/CSS/JS Preview'
												sandbox='allow-scripts'
											/>
										</div>
									</TabsContent>
								</Tabs>
							)}
							{generatedSnippet && activeTab === 'snippet' && (
								<>
									<div className='flex space-x-4 mt-6'>
										<Button
											onClick={handleDownload}
											className='flex-1 bg-green-600 hover:bg-green-700 text-white transition-colors duration-200'
										>
											<Download className='w-4 h-4 mr-2' />
											Download
										</Button>
										<Button
											onClick={handleShare}
											className='flex-1 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200'
										>
											<Share2 className='w-4 h-4 mr-2' />
											Share
										</Button>
									</div>
									<div className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
										<p>
											<em>Note: Downloaded image will be in PNG format.</em>
										</p>
										<p>
											<em>
												Note: For best results, zoom in or crop the image while
												sharing.
											</em>
										</p>
									</div>
								</>
							)}
						</motion.div>
					</div>
				</Card>
			</div>
			<motion.footer
				className='mt-8 text-center text-sm text-gray-600 dark:text-gray-400'
				initial={{ y: 50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 1.1, duration: 0.5 }}
			>
				<p className='font-semibold'>Created by Aditya</p>
				<p>Software Engineer | React TS Next.js Developer</p>
				<p>
					Passionate about creating beautiful and efficient web applications
				</p>
			</motion.footer>
			<AnimatePresence>
				{showAlert && (
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 50 }}
						className='fixed bottom-4 right-4 z-50'
					>
						<Alert variant='default'>
							<Info className='h-4 w-4' />
							<AlertTitle>Success!</AlertTitle>
							<AlertDescription>
								Your code snippet has been {showAlert ? 'downloaded' : 'shared'}{' '}
								successfully.
							</AlertDescription>
						</Alert>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.main>
	);
}
