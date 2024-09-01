'use client';

import React, { useState } from 'react';
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

export default function Home() {
	const [fontSize, setFontSize] = useState(14);

	return (
		<main className='flex min-h-screen flex-col items-center justify-center p-24'>
			<Card className='w-full max-w-md p-6 space-y-6 bg-background'>
				<h1 className='text-2xl font-bold text-center text-foreground'>
					Code Snapgram
				</h1>

				<div className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='code-input' className='text-foreground'>
							Code Snippet
						</Label>
						<Textarea
							id='code-input'
							placeholder='Enter your code here'
							className='font-mono bg-background text-foreground'
							rows={6}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='language-select' className='text-foreground'>
							Language
						</Label>
						<Select>
							<SelectTrigger
								id='language-select'
								className='bg-background text-foreground'
							>
								<SelectValue placeholder='Select a language' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='typescript'>TypeScript</SelectItem>
								<SelectItem value='javascript'>JavaScript</SelectItem>
								<SelectItem value='python'>Python</SelectItem>
								<SelectItem value='java'>Java</SelectItem>
								<SelectItem value='csharp'>C#</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='font-size-slider' className='text-foreground'>
							Font Size: {fontSize}px
						</Label>
						<Slider
							id='font-size-slider'
							min={8}
							max={24}
							step={1}
							value={[fontSize]}
							onValueChange={(value) => setFontSize(value[0])}
						/>
					</div>

					<div className='p-4 border rounded-md bg-background'>
						<p
							style={{ fontSize: `${fontSize}px` }}
							className='font-mono text-foreground'
						>
							Preview: The quick brown fox jumps over the lazy dog.
						</p>
					</div>

					<Button className='w-full'>Generate Snippet</Button>
				</div>
			</Card>
		</main>
	);
}
