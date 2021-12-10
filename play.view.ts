namespace $.$$ {
	export class $hyoo_play extends $.$hyoo_play {
		
		receive( transfer: DataTransfer ) {
			
			const files = [] as File[]
			
			function collect( file: File, entry: FileSystemEntry  ) {
				
				if( entry.isFile ) files.push( file )
				
				// if( entry.isDirectory ) {
					
				// 	const reader = ( entry as FileSystemDirectoryEntry ).createReader()
				// 	const more = ()=> {
				// 		reader.readEntries( res => {
							
				// 			if( !res.length ) return
							
				// 			for( const e of res ) {
				// 				;( e as FileSystemFileEntry ).file( f => {
				// 					collect( f, e )
				// 				} )
				// 			}
							
				// 			more()
							
				// 		} )
				// 	}
				// 	more()
					
				// }
				
			}
			
			for( const item of transfer.items ) {
				collect( item.getAsFile()!, item.webkitGetAsEntry()! )
			}
			
			this.files_add( files.sort( $mol_compare_text( file => file.name ) ) )
			
		}
		
		files_add( files: File[] ) {
			this.files([ ... new Set([ ... this.files(), ... files ]) ])
			if( !this.file_current() ) this.file_current( files[0] )
			return files
		}
		
		// @ $mol_mem
		// file_current( next?: File ) {
		// 	return next ?? this.files()[ 0 ] ?? null
		// }
		
		@ $mol_mem
		queue_files() {
			return this.files().map( ( file , index )=> this.File( file ) )
		}
		
		file_title( file: File ) {
			return file.name
		}
		
		file_enabled( file: File ) {
			return file !== this.file_current()
		}
		
		file_play( file: File ) {
			this.file_current( file )
		}
		
		file_drop( file: File ) {
			this.files( this.files().filter( f => f !== file ) )
		}
		
		@ $mol_mem
		pages() {
			return [
				this.Queue(),
				... this.file_current() ? [ this.Player() ] : [],
			]
		}
		
		@ $mol_mem
		play_title() {
			const file = this.file_current()
			return file ? file.name.replace( /\.[^.]+$/, '' ) : ''
		}
		
		@ $mol_mem
		play_uri() {
			const file = this.file_current()
			return file ? URL.createObjectURL( file ) : 'about:blank'
		}
		
		@ $mol_mem
		auto_switch() {
			
			if( this.files().length < 2 ) return null
			
			const player = this.Player()
			if( player.playing() ) return null
			if( player.time() !== player.duration() ) return null
			
			const files = this.files()
			let index = ( files.indexOf( this.file_current() ) + 1 ) % files.length
			
			this.file_current( files[ index ] )
			
			return null
		}
		
		auto() {
			this.auto_switch()
		}
		
	}
}
