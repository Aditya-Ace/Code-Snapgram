'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { Input } from '@/components/ui/input';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toPng } from 'html-to-image';
import {
	Download,
	Share2,
	Moon,
	Sun,
	Info,
	Sparkles,
	ExternalLink,
	Copy,
	Check,
	ChevronDown,
	ChevronUp,
	Edit2
} from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { detectLanguage } from '@/lib/utils';

export default function CodeSnapgram() {
	const [code, setCode] = useState('');
	const [language, setLanguage] = useState('javascript');
	const [fontSize, setFontSize] = useState(14);
	const [generatedSnippet, setGeneratedSnippet] = useState('');
	const [previewContent, setPreviewContent] = useState('');
	const snippetRef = useRef<HTMLDivElement>(null);
	const { theme, setTheme } = useTheme();
	const [showAlert, setShowAlert] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState('snippet');
	const [autoFormat, setAutoFormat] = useState(true);
	const [copied, setCopied] = useState(false);
	const [customMessage, setCustomMessage] = useState(
		'Made with ❤️ using Next.js by Aditya'
	);
	const [isCustomMessagePaid, setIsCustomMessagePaid] = useState(false);
	const [upiId, setUpiId] = useState('');
	const [showPaymentDialog, setShowPaymentDialog] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [showFullCode, setShowFullCode] = useState(false);
	const [showImageSizeDialog, setShowImageSizeDialog] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [imageSize, setImageSize] = useState({
		width: 600,
		height: 400
	});

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
			setImageSize({
				width: window.innerWidth < 768 ? 300 : 600,
				height: window.innerWidth < 768 ? 400 : 400
			});
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	const handleGenerateSnippet = useCallback(async () => {
		const beautifyCode = async (code: string, language: string) => {
			if (!autoFormat) return code;
			try {
				let formattedCode = code;
				switch (language) {
					case 'javascript':
					case 'typescript':
						formattedCode = await prettier.format(code, {
							parser: language === 'javascript' ? 'babel' : 'typescript',
							plugins: [parserBabel, parserTypescript],
							printWidth: Math.floor(imageSize.width / (fontSize * 0.6)),
							semi: true,
							singleQuote: true,
							useTabs: true,
							tabWidth: 2
						});
						break;
					case 'html':
						formattedCode = await prettier.format(code, {
							parser: 'html',
							plugins: [parserHtml],
							printWidth: Math.floor(imageSize.width / (fontSize * 0.6)),
							useTabs: true,
							tabWidth: 2
						});
						break;
					case 'css':
						formattedCode = await prettier.format(code, {
							parser: 'css',
							plugins: [parserCss],
							printWidth: Math.floor(imageSize.width / (fontSize * 0.6)),
							useTabs: true,
							tabWidth: 2
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

		const beautifiedCode = await beautifyCode(code, language);
		setGeneratedSnippet(beautifiedCode);
		setPreviewContent(beautifiedCode);
		setShowFullCode(false);
	}, [
		code,
		language,
		autoFormat,
		imageSize.width,
		fontSize,
		setGeneratedSnippet,
		setPreviewContent,
		setShowFullCode
	]);

	const handleDownload = async () => {
		if (snippetRef.current === null) {
			return;
		}
		try {
			setIsDownloading(true);
			const dataUrl = await toPng(snippetRef.current, {
				cacheBust: true,
				pixelRatio: 2,
				width: imageSize.width,
				height: imageSize.height,
				style: {
					transform: 'scale(1)',
					transformOrigin: 'top left'
				}
			});
			const link = document.createElement('a');
			link.download = 'code-snippet.png';
			link.href = dataUrl;
			link.click();
			setShowAlert('download');
			setTimeout(() => setShowAlert(null), 3000);
		} catch (err) {
			console.error('Error downloading image:', err);
		} finally {
			setIsDownloading(false);
		}
	};

	const handleShare = async () => {
		if (snippetRef.current === null) {
			return;
		}
		try {
			setIsDownloading(true);
			const dataUrl = await toPng(snippetRef.current, {
				cacheBust: true,
				pixelRatio: 2,
				width: imageSize.width,
				height: imageSize.height,
				style: {
					transform: 'scale(1)',
					transformOrigin: 'top left'
				}
			});
			const blob = await (await fetch(dataUrl)).blob();
			const file = new File([blob], 'code-snippet.png', {
				type: 'image/png'
			});
			if (navigator.canShare && navigator.canShare({ files: [file] })) {
				navigator
					.share({
						title: 'Check out my code snippet!',
						text: 'I created this code snippet using Code Snapgram.',
						files: [file]
					})
					.then(() => {
						setShowAlert('share');
						setTimeout(() => setShowAlert(null), 3000);
					})
					.catch(console.error);
			} else {
				const link = document.createElement('a');
				link.href = dataUrl;
				link.download = 'code-snippet.png';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				setShowAlert('share');
				setTimeout(() => setShowAlert(null), 3000);
			}
		} catch (err) {
			console.error('Error sharing image:', err);
		} finally {
			setIsDownloading(false);
		}
	};

	const handleCopyCode = () => {
		navigator.clipboard.writeText(generatedSnippet);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleImageSizeChange = (newSize: {
		width: number;
		height: number;
	}) => {
		setImageSize(newSize);
		setShowImageSizeDialog(false);
		handleGenerateSnippet();
	};

	const openPreviewInNewWindow = () => {
		const previewWindow = window.open('', '_blank');
		if (previewWindow) {
			previewWindow.document.write(`
        <html>
          <head>
            <title>Code Preview</title>
            ${language === 'css' ? `<style>${previewContent}</style>` : ''}
          </head>
          <body>
            ${language === 'html' ? previewContent : ''}
            ${['javascript', 'typescript'].includes(language) ? `<script>${previewContent}</script>` : ''}
          </body>
        </html>
      `);
			previewWindow.document.close();
		}
	};

	const handleCustomMessageChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		if (isCustomMessagePaid) {
			setCustomMessage(e.target.value);
		} else {
			setShowPaymentDialog(true);
		}
	};

	const handlePayment = () => {
		// In a real-world scenario, we would integrate with a UPI payment gateway here
		// For this example, we'll simulate a successful payment
		setIsCustomMessagePaid(true);
		setShowPaymentDialog(false);
		setShowAlert('payment');
		setTimeout(() => setShowAlert(null), 3000);
	};

	const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newCode = e.target.value;
		setCode(newCode);
		const detectedLang = detectLanguage(newCode);
		setLanguage(detectedLang);
	};

	const handleGeneratedCodeChange = (
		e: React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setGeneratedSnippet(e.target.value);
	};

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
				handleGenerateSnippet();
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, [handleGenerateSnippet]);

	return (
		<motion.main
			className='flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-gray-900 dark:to-gray-800'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			<div className='w-full max-w-6xl mx-auto'>
				<div className='flex flex-col md:flex-row justify-between items-center mb-6 gap-4'>
					<motion.h1
						className='text-3xl md:text-4xl font-bold text-purple-800 dark:text-purple-300 text-center md:text-left'
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
									onChange={handleCodeChange}
								/>
							</div>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div className='space-y-2'>
									<Label
										htmlFor='language-select'
										className='text-gray-700 dark:text-gray-300'
									>
										Language (Auto-detected)
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
							<div className='flex items-center space-x-2'>
								<Switch
									id='auto-format'
									checked={autoFormat}
									onCheckedChange={(checked) => {
										setAutoFormat(checked);
										handleGenerateSnippet();
									}}
								/>
								<Label
									htmlFor='auto-format'
									className='text-gray-700 dark:text-gray-300'
								>
									Auto-format code
								</Label>
							</div>
							<div className='space-y-2'>
								<Label
									htmlFor='custom-message'
									className='text-gray-700 dark:text-gray-300'
								>
									Custom Message
								</Label>
								<Input
									id='custom-message'
									value={customMessage}
									onChange={handleCustomMessageChange}
									placeholder='Enter your custom message'
									className='bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-2 border-purple-300 dark:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent'
								/>
								{!isCustomMessagePaid && (
									<p className='text-sm text-gray-500 dark:text-gray-400'>
										Pay ₹25 to customize this message
									</p>
								)}
							</div>
							<Button
								className='w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200'
								onClick={handleGenerateSnippet}
							>
								Generate Snippet (Ctrl/Cmd + Enter)
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
										<div className='relative w-full overflow-hidden'>
											<div
												ref={snippetRef}
												className='rounded-lg overflow-hidden shadow-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-4'
												style={{
													width: imageSize.width,
													height: imageSize.height
												}}
											>
												<div className='rounded-lg overflow-y-auto bg-gray-900 p-4 relative flex flex-col h-full'>
													<div className='absolute top-2 left-2 flex space-x-1'>
														<div className='w-3 h-3 rounded-full bg-red-500'></div>
														<div className='w-3 h-3 rounded-full bg-yellow-500'></div>
														<div className='w-3 h-3 rounded-full bg-green-500'></div>
													</div>
													{!isDownloading && (
														<div className='absolute top-2 right-2 flex space-x-2'>
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger asChild>
																		<Button
																			variant='ghost'
																			size='icon'
																			className='text-gray-400 hover:text-white transition-colors'
																			onClick={handleCopyCode}
																		>
																			{copied ? (
																				<Check className='h-4 w-4' />
																			) : (
																				<Copy className='h-4 w-4' />
																			)}
																		</Button>
																	</TooltipTrigger>
																	<TooltipContent>
																		<p>{copied ? 'Copied!' : 'Copy code'}</p>
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger asChild>
																		<Button
																			variant='ghost'
																			size='icon'
																			className='text-gray-400 hover:text-white transition-colors'
																			onClick={() => setIsEditing(!isEditing)}
																		>
																			<Edit2 className='h-4 w-4' />
																		</Button>
																	</TooltipTrigger>
																	<TooltipContent>
																		<p>
																			{isEditing ? 'Save changes' : 'Edit code'}
																		</p>
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
														</div>
													)}
													{isEditing ? (
														<Textarea
															value={generatedSnippet}
															onChange={handleGeneratedCodeChange}
															className='font-mono bg-transparent text-white h-full w-full resize-none border-none focus:ring-0'
															style={{ fontSize: `${fontSize}px` }}
														/>
													) : (
														<>
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
																	overflowY: 'auto',
																	maxHeight: showFullCode
																		? 'none'
																		: isMobile
																			? '50vh'
																			: imageSize.height - 80
																}}
																wrapLines={true}
																wrapLongLines={true}
															>
																{showFullCode
																	? generatedSnippet
																	: generatedSnippet
																			.split('\n')
																			.slice(0, 15)
																			.join('\n')}
															</SyntaxHighlighter>
															{!isDownloading &&
																generatedSnippet.split('\n').length > 15 && (
																	<Button
																		variant='ghost'
																		size='sm'
																		className='mt-2 text-gray-400 hover:text-white transition-colors self-center'
																		onClick={() =>
																			setShowFullCode(!showFullCode)
																		}
																	>
																		{showFullCode ? (
																			<>
																				View less{' '}
																				<ChevronUp className='ml-1 h-4 w-4' />
																			</>
																		) : (
																			<>
																				View more{' '}
																				<ChevronDown className='ml-1 h-4 w-4' />
																			</>
																		)}
																	</Button>
																)}
														</>
													)}
													<div className='text-[0.5rem] text-gray-400 opacity-75 font-semibold mt-2 text-center'>
														{customMessage}
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
															<style>${language === 'css' ? previewContent : ''}</style>
															</head>
															<body>
															${language === 'html' ? previewContent : ''}
															${['javascript', 'typescript'].includes(language) ? `<script>${previewContent}</script>` : ''}
															</body>
														</html>
														`}
												className='w-full h-full border-none'
												title='Code Preview'
												sandbox='allow-scripts'
											/>
										</div>
										<div className='flex justify-end mt-4'>
											<Button
												variant='outline'
												size='sm'
												onClick={openPreviewInNewWindow}
											>
												<ExternalLink className='w-4 h-4 mr-2' />
												Open in New Window
											</Button>
										</div>
									</TabsContent>
								</Tabs>
							)}
							{generatedSnippet && activeTab === 'snippet' && (
								<>
									<div className='flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6'>
										<Button
											onClick={handleDownload}
											className='flex-1 bg-green-600 hover:bg-green-700 text-white transition-colors duration-200'
											disabled={isDownloading}
										>
											<Download className='w-4 h-4 mr-2' />
											{isDownloading ? 'Downloading...' : 'Download'}
										</Button>
										<Button
											onClick={handleShare}
											className='flex-1 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200'
											disabled={isDownloading}
										>
											<Share2 className='w-4 h-4 mr-2' />
											{isDownloading ? 'Sharing...' : 'Share'}
										</Button>
										<Button
											onClick={() => setShowImageSizeDialog(true)}
											className='flex-1 bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200'
										>
											Set Image Size
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
								{showAlert === 'download' &&
									'Your code snippet has been downloaded successfully.'}
								{showAlert === 'share' &&
									'Your code snippet has been shared successfully.'}
								{showAlert === 'payment' &&
									'Payment successful! You can now customize your message.'}
							</AlertDescription>
						</Alert>
					</motion.div>
				)}
			</AnimatePresence>
			<Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Payment Required</DialogTitle>
						<DialogDescription>
							To customize the message, please pay ₹25 using UPI.
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='upi-id'>UPI ID</Label>
							<Input
								id='upi-id'
								value={upiId}
								onChange={(e) => setUpiId(e.target.value)}
								placeholder='Enter your UPI ID'
							/>
						</div>
						<Button onClick={handlePayment} className='w-full'>
							Pay ₹25
						</Button>
					</div>
				</DialogContent>
			</Dialog>
			<Dialog open={showImageSizeDialog} onOpenChange={setShowImageSizeDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Set Image Size</DialogTitle>
						<DialogDescription>
							Choose the size for your generated image.
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='image-width'>Width (px)</Label>
							<Input
								id='image-width'
								type='number'
								value={imageSize.width}
								onChange={(e) =>
									setImageSize({ ...imageSize, width: Number(e.target.value) })
								}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='image-height'>Height (px)</Label>
							<Input
								id='image-height'
								type='number'
								value={imageSize.height}
								onChange={(e) =>
									setImageSize({ ...imageSize, height: Number(e.target.value) })
								}
							/>
						</div>
						<Button
							onClick={() => handleImageSizeChange(imageSize)}
							className='w-full'
						>
							Apply Size
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</motion.main>
	);
}
